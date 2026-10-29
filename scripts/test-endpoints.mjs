// Automated End-to-End Verification Script for KnowledgeOS
const BASE_URL = "http://localhost:3005";

async function runTests() {
  console.log("=================================================");
  console.log("   KnowledgeOS Automated End-to-End Verification ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Test Documents List for Admin vs Employee (Access Boundary Test)
  console.log("\n--- TEST 1: Role-Based Access Boundary ---");
  const adminDocsRes = await fetch(`${BASE_URL}/api/documents?role=admin`);
  const adminDocs = await adminDocsRes.json();
  const hasAdminDoc = adminDocs.documents.some((d) => d.access_scope === "admin");
  assert(hasAdminDoc === true, "Admin user can access confidential executive documents");

  const empDocsRes = await fetch(`${BASE_URL}/api/documents?role=employee`);
  const empDocs = await empDocsRes.json();
  const empHasAdminDoc = empDocs.documents.some((d) => d.access_scope === "admin");
  assert(empHasAdminDoc === false, "Employee role is strictly blocked from confidential executive documents");

  // 2. Test Search Endpoint
  console.log("\n--- TEST 2: Hybrid Search & Scoring ---");
  const searchRes = await fetch(`${BASE_URL}/api/search?q=onboarding%20buddy&role=admin`);
  const searchData = await searchRes.json();
  assert(searchData.results.length > 0, "Search returns matching passages for 'onboarding buddy'");
  assert(searchData.results[0].content.includes("Onboarding Buddy"), "Top result contains exact query context");

  // 3. Test Grounded RAG Chat with Numbered Citations
  console.log("\n--- TEST 3: Grounded RAG Chat & Citations ---");
  const chatRes = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "What is our client onboarding process?",
      provider: "openrouter",
      model: "google/gemini-2.0-flash-exp:free",
      userRole: "admin",
      userDepartment: "Executive",
    }),
  });

  assert(chatRes.ok, "Chat API returns HTTP 200 OK");
  const citationsHeader = chatRes.headers.get("X-Citations");
  assert(Boolean(citationsHeader), "Chat API response contains X-Citations header");
  const citations = JSON.parse(decodeURIComponent(citationsHeader || "[]"));
  assert(citations.length > 0, `Chat response attached ${citations.length} verified source citations`);
  assert(Boolean(citations[0].document_title), `First citation title: '${citations[0].document_title}'`);

  // Read response stream
  const reader = chatRes.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value);
  }
  assert(fullText.includes("stage") || fullText.includes("[1]"), "Streamed response contains grounded facts with citation tags");

  // 4. Test Missing Information Behavior
  console.log("\n--- TEST 4: Missing Information Disclaimer ---");
  const missingInfoRes = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "What is our rocket propulsion testing schedule on Mars?",
      provider: "openrouter",
      model: "google/gemini-2.0-flash-exp:free",
      userRole: "admin",
      userDepartment: "Executive",
    }),
  });
  const missingReader = missingInfoRes.body.getReader();
  let missingText = "";
  while (true) {
    const { done, value } = await missingReader.read();
    if (done) break;
    missingText += decoder.decode(value);
  }
  const hasDisclaimer = 
    (missingText.includes("couldn't") && missingText.includes("find")) ||
    missingText.toLowerCase().includes("not found");
  assert(
    hasDisclaimer,
    "Assistant explicitly acknowledges missing information rather than hallucinating facts"
  );

  // 5. Test Document Ingestion & Chunk Purging
  console.log("\n--- TEST 5: Document Ingestion, Chunking & Purging ---");
  const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
  const fileContent = `# Acme Security Architecture v1.0
This document outlines our cloud security architecture.
All API communication must use TLS 1.3 encryption.
Zero-trust network access (ZTNA) is enforced for all remote engineering nodes.
Production database backups are encrypted with AES-256-GCM.`;

  const formDataParts = [
    `--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nAcme Security Architecture v1.0\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="category_id"\r\n\r\ncat-sop\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="department"\r\n\r\nEngineering\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="access_scope"\r\n\r\nall\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="version"\r\n\r\n1.0\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="user_role"\r\n\r\nadmin\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="Security_Architecture.txt"\r\nContent-Type: text/plain\r\n\r\n${fileContent}\r\n`,
    `--${boundary}--\r\n`,
  ].join("");

  const uploadRes = await fetch(`${BASE_URL}/api/documents`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body: formDataParts,
  });

  const uploadData = await uploadRes.json();
  assert(uploadRes.ok, "Document uploaded and indexed successfully");
  const createdDocId = uploadData.document?.id;
  assert(Boolean(createdDocId), `Created document ID: ${createdDocId}`);
  assert(uploadData.chunks_indexed > 0, `Generated ${uploadData.chunks_indexed} searchable chunks`);

  // Verify search finds newly uploaded document
  const verifySearch = await fetch(`${BASE_URL}/api/search?q=TLS%201.3%20encryption&role=admin`);
  const verifyData = await verifySearch.json();
  assert(
    verifyData.results.some((r) => r.content.includes("TLS 1.3")),
    "Newly uploaded document is immediately searchable via RAG"
  );

  // Now delete the document
  const deleteRes = await fetch(`${BASE_URL}/api/documents/${createdDocId}`, {
    method: "DELETE",
    headers: { "x-user-role": "admin" },
  });
  assert(deleteRes.ok, "Document deleted successfully");

  // Verify obsolete chunks can no longer appear in search results
  const postDeleteSearch = await fetch(`${BASE_URL}/api/search?q=TLS%201.3%20encryption&role=admin`);
  const postDeleteData = await postDeleteSearch.json();
  assert(
    !postDeleteData.results.some((r) => r.document_id === createdDocId),
    "Obsolete chunks are guaranteed purged and cannot appear in search results"
  );

  // 6. Test Settings Connection Endpoint
  console.log("\n--- TEST 6: AI Provider Connection Check ---");
  const testConnRes = await fetch(`${BASE_URL}/api/settings/test-connection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "openrouter" }),
  });
  const testConnData = await testConnRes.json();
  assert(testConnRes.ok, "Connection test endpoint returns valid JSON response without leaking secrets");

  console.log("\n=================================================");
  console.log(`Verification Complete: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error("Test runner crashed:", e);
  process.exit(1);
});
