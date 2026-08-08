import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and HEIC are allowed." },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // If Vercel Blob token is configured, use Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(
        `receipts/${session.user.id}/${Date.now()}-${file.name}`,
        file,
        {
          access: "public",
          contentType: file.type,
        }
      );
      return NextResponse.json({ url: blob.url });
    }

    // Fallback for self-hosted / VPS: local filesystem storage in public/uploads
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "receipts", session.user.id);
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    const publicUrl = `${basePath}/uploads/receipts/${session.user.id}/${filename}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during upload" },
      { status: 500 }
    );
  }
}
