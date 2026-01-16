// futbolproyect-nextjs/src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Permitimos la carga de archivos estáticos (imágenes, estilos) para que no se rompa todo
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // HTML simple para la página de mantenimiento
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>En Mantenimiento</title>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f0f0; margin: 0; }
          .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          h1 { color: #333; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Sitio en Mantenimiento</h1>
          <p>Estamos realizando mejoras importantes. Volveremos en breve.</p>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 503,
    headers: { "content-type": "text/html" },
  });
}

// Aplicamos esto a todas las rutas
export const config = {
  matcher: "/:path*",
};
