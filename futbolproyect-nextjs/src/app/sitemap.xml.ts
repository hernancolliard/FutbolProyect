export default async function sitemap() {
  return [
    {
      url: "https://futbolproyect.com/perfiles",
      lastModified: new Date().toISOString(),
    },
    {
      url: "https://futbolproyect.com/ofertas",
      lastModified: new Date().toISOString(),
    },
    {
      url: "https://futbolproyect.com/sitemap-perfiles.xml",
      lastModified: new Date().toISOString(),
    },
    {
      url: "https://futbolproyect.com/sitemap-ofertas.xml",
      lastModified: new Date().toISOString(),
    },
  ];
}
