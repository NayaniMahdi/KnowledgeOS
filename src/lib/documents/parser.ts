import mammoth from "mammoth";
import Papa from "papaparse";

export interface ParsedDocument {
  text: string;
  pageCount?: number;
  metadata?: Record<string, any>;
}

export async function parseDocumentFile(
  buffer: Buffer,
  fileName: string,
  fileType: string
): Promise<ParsedDocument> {
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();

  // 1. Text and Markdown files
  if (extension === ".txt" || extension === ".md" || fileType.includes("text")) {
    const text = buffer.toString("utf-8");
    return {
      text,
      pageCount: 1,
    };
  }

  // 2. CSV Files
  if (extension === ".csv" || fileType.includes("csv")) {
    const rawText = buffer.toString("utf-8");
    const parsed = Papa.parse(rawText, { header: true });
    
    // Convert CSV rows into structured markdown table/records for high retrieval accuracy
    let markdownTable = `Table Document: ${fileName}\n\n`;
    if (parsed.meta.fields && parsed.meta.fields.length > 0) {
      markdownTable += `| ${parsed.meta.fields.join(" | ")} |\n`;
      markdownTable += `| ${parsed.meta.fields.map(() => "---").join(" | ")} |\n`;
      for (const row of parsed.data.slice(0, 500) as Record<string, string>[]) {
        const values = parsed.meta.fields.map((f) => (row[f] ? String(row[f]).replace(/\|/g, "-") : ""));
        markdownTable += `| ${values.join(" | ")} |\n`;
      }
    } else {
      markdownTable = rawText;
    }

    return {
      text: markdownTable,
      pageCount: 1,
    };
  }

  // 3. Word DOCX Files
  if (extension === ".docx" || fileType.includes("wordprocessingml")) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return {
        text: result.value,
        pageCount: 1,
        metadata: {
          messages: result.messages,
        },
      };
    } catch (err: any) {
      throw new Error(`Failed to parse DOCX file: ${err.message}`);
    }
  }

  // 4. PDF Files
  if (extension === ".pdf" || fileType.includes("pdf")) {
    try {
      // Dynamic import pdf-parse to prevent serverless bundling errors
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      return {
        text: data.text,
        pageCount: data.numpages || 1,
        metadata: {
          info: data.info,
        },
      };
    } catch (err: any) {
      console.warn("pdf-parse module warning, using structured text fallback:", err);
      // Fallback clean extraction if pdf-parse encounters native issues
      const rawString = buffer.toString("utf-8", 0, Math.min(buffer.length, 50000));
      const extractedWords = rawString
        .replace(/[^\x20-\x7E\n]/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();

      if (extractedWords.length > 50) {
        return {
          text: extractedWords,
          pageCount: 1,
        };
      }
      throw new Error(`Could not parse PDF file: ${err.message || "Invalid or encrypted PDF"}`);
    }
  }

  // Fallback for generic text
  const fallbackText = buffer.toString("utf-8");
  return {
    text: fallbackText,
    pageCount: 1,
  };
}
