import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { importUploadedDocument } from "@/lib/documents/import";

export const runtime = "nodejs";

const MAX_IMPORT_SIZE = 6 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const formData = await request.formData();
  const entry = formData.get("file");

  if (!(entry instanceof File)) {
    return NextResponse.json(
      { error: "Bitte wähle eine PDF- oder DOCX-Datei aus." },
      { status: 400 }
    );
  }

  if (entry.size <= 0) {
    return NextResponse.json(
      { error: "Die Datei ist leer." },
      { status: 400 }
    );
  }

  if (entry.size > MAX_IMPORT_SIZE) {
    return NextResponse.json(
      { error: "Bitte wähle eine Datei bis 6 MB." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await entry.arrayBuffer());
    const result = await importUploadedDocument(entry.name, buffer);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error importing document upload:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Die Datei konnte nicht in Markdown umgewandelt werden.",
      },
      { status: 400 }
    );
  }
}
