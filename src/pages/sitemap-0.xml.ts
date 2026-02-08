import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const urls = [
    { url: "/", changefreq: "weekly", priority: "1.0" },
    { url: "/producto1", changefreq: "monthly", priority: "0.9" },
    { url: "/producto2", changefreq: "monthly", priority: "0.9" },
    { url: "/producto3", changefreq: "monthly", priority: "0.9" },
    { url: "/producto4", changefreq: "monthly", priority: "0.9" },
    { url: "/accesorio1", changefreq: "monthly", priority: "0.8" },
    { url: "/accesorio2", changefreq: "monthly", priority: "0.8" },
    { url: "/accesorio3", changefreq: "monthly", priority: "0.8" },
    { url: "/accesorio4", changefreq: "monthly", priority: "0.8" },
    { url: "/accesorio5", changefreq: "monthly", priority: "0.8" },
    { url: "/privacidad", changefreq: "yearly", priority: "0.5" },
    { url: "/reclamaciones", changefreq: "yearly", priority: "0.5" },
  ];

  const base = "https://peruvianflavorscoffee.com";
  const lastmod = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${base}${item.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
