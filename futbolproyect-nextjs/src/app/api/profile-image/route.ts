import { NextRequest, NextResponse } from "next/server";

const ALLOWED_IMAGE_HOST =
  /^futbolproyect-imagenes\.s3(?:\.[a-z0-9-]+)?\.amazonaws\.com$/i;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("url");
  if (!source) {
    return NextResponse.json({ message: "Missing image URL." }, { status: 400 });
  }

  let imageUrl: URL;
  try {
    imageUrl = new URL(source);
  } catch {
    return NextResponse.json({ message: "Invalid image URL." }, { status: 400 });
  }

  if (imageUrl.protocol !== "https:" || !ALLOWED_IMAGE_HOST.test(imageUrl.hostname)) {
    return NextResponse.json({ message: "Image host not allowed." }, { status: 403 });
  }

  try {
    const imageResponse = await fetch(imageUrl, {
      next: { revalidate: 3600 },
    });
    const contentType = imageResponse.headers.get("content-type") || "";
    const contentLength = Number(imageResponse.headers.get("content-length") || 0);

    if (!imageResponse.ok || !contentType.startsWith("image/")) {
      return NextResponse.json({ message: "Image could not be loaded." }, { status: 502 });
    }
    if (contentLength > MAX_IMAGE_SIZE) {
      return NextResponse.json({ message: "Image is too large." }, { status: 413 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    if (imageBuffer.byteLength > MAX_IMAGE_SIZE) {
      return NextResponse.json({ message: "Image is too large." }, { status: 413 });
    }

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json({ message: "Image could not be loaded." }, { status: 502 });
  }
}
