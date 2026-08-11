import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Protect sensitive areas from search engines
      disallow: ['/admin/', '/dashboard/', '/api/'],
    },
    sitemap: 'https://ewalogistics.com/sitemap.xml',
  }
}