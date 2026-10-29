import { DocumentChunk } from "@/lib/types";

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export function chunkText(
  text: string,
  documentId: string,
  documentTitle: string,
  categoryName?: string,
  options: ChunkOptions = {}
): DocumentChunk[] {
  const chunkSize = options.chunkSize || 800;
  const chunkOverlap = options.chunkOverlap || 150;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // Clean and normalize text
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Look for section headers (e.g., "# Header", "Section 1:", "=== Header ===")
  const paragraphs = cleanedText.split("\n\n");
  const chunks: DocumentChunk[] = [];

  let currentChunk = "";
  let currentSection = "General";
  let currentPage = 1;
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    if (!para) continue;

    // Detect section header
    if (para.startsWith("#") || /^section\s+\d+/i.test(para) || /^[A-Z0-9\s-]{4,40}:$/m.test(para)) {
      currentSection = para.replace(/^#+\s*/, "").split("\n")[0].trim();
    }

    // Detect page markers if parser injected "[PAGE X]"
    const pageMatch = para.match(/\[PAGE\s+(\d+)\]/i);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10);
    }

    if ((currentChunk + "\n\n" + para).length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        id: `chk-${documentId}-${chunkIndex}`,
        document_id: documentId,
        document_title: documentTitle,
        category_name: categoryName,
        chunk_index: chunkIndex,
        content: currentChunk.trim(),
        page_number: currentPage,
        section_title: currentSection,
        metadata: {
          char_length: currentChunk.length,
          word_count: currentChunk.split(/\s+/).length,
        },
      });

      chunkIndex++;

      // Retain overlap from end of previous chunk
      const overlapText = currentChunk.slice(-chunkOverlap);
      currentChunk = overlapText + "\n\n" + para;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + para : para;
    }
  }

  // Final remaining chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `chk-${documentId}-${chunkIndex}`,
      document_id: documentId,
      document_title: documentTitle,
      category_name: categoryName,
      chunk_index: chunkIndex,
      content: currentChunk.trim(),
      page_number: currentPage,
      section_title: currentSection,
      metadata: {
        char_length: currentChunk.length,
        word_count: currentChunk.split(/\s+/).length,
      },
    });
  }

  return chunks;
}
