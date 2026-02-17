export const GET = async () => {
  const urls = [
    { url: '', priority: 1.0 },
    { url: '/early-access', priority: 0.8 },
    { url: '/waitlist-success', priority: 0.6 },
    { url: '/verify', priority: 0.6 },
    { url: '/login', priority: 0.7 },
    { url: '/blog/upwork-fiverr-red-flags', priority: 0.7 },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ url, priority }) => `
  <url>
    <loc>https://www.contractchecker.net${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=604800'
    }
  });
};
