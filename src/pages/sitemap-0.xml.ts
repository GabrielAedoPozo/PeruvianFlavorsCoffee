import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const urls = [
    "/",
    "/producto1",
    "/producto2",
    "/producto3",
    "/producto4",
    "/accesorio1",
    "/accesorio2",
    "/accesorio3",
    "/accesorio4",
    "/accesorio5",
    "/privacidad",
    "/reclamaciones",
  ];

  const base = "https://peruvianflavorscoffee.com";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `
  <url>
    <loc>${base}${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url === "/" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
    },
  });
};
