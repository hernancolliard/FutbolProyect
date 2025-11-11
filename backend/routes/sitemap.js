const express = require('express');
const router = express.Router();
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const links = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/offers', changefreq: 'daily', priority: 0.9 },
      { url: '/perfiles-destacados', changefreq: 'weekly', priority: 0.8 },
      { url: '/contact', changefreq: 'monthly', priority: 0.7 },
      { url: '/subscribe', changefreq: 'monthly', priority: 0.7 },
      { url: '/terms', changefreq: 'yearly', priority: 0.3 },
      { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
    ];

    // Fetch offers
    const offersQuery = await db.query('SELECT id FROM ofertas_laborales WHERE estado = @estado', { estado: 'abierta' });
    offersQuery.rows.forEach(offer => {
      links.push({
        url: `/offers/${offer.id}`,
        changefreq: 'weekly',
        priority: 0.8
      });
    });

    // Fetch user profiles
    const usersQuery = await db.query('SELECT id FROM usuarios WHERE rol IN (@roles) AND activo = TRUE', { roles: ['jugador', 'entrenador', 'scout'] });
    usersQuery.rows.forEach(user => {
      links.push({
        url: `/profile/${user.id}`,
        changefreq: 'weekly',
        priority: 0.6
      });
    });

    const stream = new SitemapStream({ hostname: 'https://futbolproyect.com' });
    
    res.header('Content-Type', 'application/xml');

    const xmlStream = Readable.from(links).pipe(stream);
    
    const sitemap = await streamToPromise(xmlStream);
    res.send(sitemap.toString());

  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
