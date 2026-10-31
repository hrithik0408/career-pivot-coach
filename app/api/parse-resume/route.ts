import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractText } from "unpdf";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: "No file provided. Please select a PDF (.pdf), Word (.docx), or plain text (.txt) file to upload.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          error: `File size exceeds the 5MB limit (${sizeMb}MB). Please upload a smaller document or paste your resume text directly.`,
        },
        { status: 413 }
      );
    }

    const filename = file.name || "resume";
    const dotIndex = filename.lastIndexOf(".");
    const ext = dotIndex !== -1 ? filename.slice(dotIndex).toLowerCase() : "";

    // Clear handling for legacy .doc binary format
    if (ext === ".doc") {
      return NextResponse.json(
        {
          error: "Legacy Word binary documents (.doc) are not supported. Please save your file as modern .docx or .pdf, or paste your text directly into the resume field.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsedText = "";

    if (ext === ".pdf") {
      try {
        const result = await extractText(new Uint8Array(arrayBuffer));
        const rawText = Array.isArray(result.text)
          ? result.text.join("\n")
          : (result.text || "");
        parsedText = rawText.trim();
      } catch (pdfErr: unknown) {
        const errMessage = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
        return NextResponse.json(
          {
            error: `Failed to read PDF (${errMessage}). If this file is password-protected or encrypted, please unlock it or paste your resume text directly.`,
          },
          { status: 422 }
        );
      }

      if (!parsedText || parsedText.trim().length < 10) {
        return NextResponse.json(
          {
            error: "No extractable text was found in this PDF. It appears to be an image-only scanned document or flattened graphic. Scanned PDFs requiring OCR are not supported—please copy and paste your resume text directly or use Wispr Flow voice dictation.",
          },
          { status: 422 }
        );
      }
    } else if (ext === ".docx") {
      try {
        const mammothResult = await mammoth.extractRawText({ buffer });
        parsedText = (mammothResult.value || "").trim();
      } catch (docxErr: unknown) {
        const errMessage = docxErr instanceof Error ? docxErr.message : String(docxErr);
        return NextResponse.json(
          {
            error: `Failed to read Word document (${errMessage}). Please save as PDF or paste your resume text directly.`,
          },
          { status: 422 }
        );
      }

      if (!parsedText || parsedText.trim().length < 10) {
        return NextResponse.json(
          {
            error: "No readable text found in this Word document. Please ensure the file contains text or paste your resume text directly.",
          },
          { status: 422 }
        );
      }
    } else if (ext === ".txt" || ext === ".md") {
      parsedText = buffer.toString("utf-8").trim();
      if (!parsedText || parsedText.trim().length < 10) {
        return NextResponse.json(
          {
            error: "The uploaded text file contains little or no text. Please verify the file contents or paste your resume text directly.",
          },
          { status: 422 }
        );
      }
    } else {
      return NextResponse.json(
        {
          error: `Unsupported file format '${ext || "unknown"}'. We support modern PDF (.pdf), Word (.docx), and plain text (.txt). Note: Scanned image-only PDFs and legacy .doc files are not supported.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: parsedText,
      filename,
      charCount: parsedText.length,
      wordCount: parsedText.split(/\s+/).filter(Boolean).length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        error: `Unexpected error processing resume file: ${message}. Please paste your resume text directly.`,
      },
      { status: 500 }
    );
  }
}
