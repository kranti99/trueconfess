/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://trueconfess.com/',
    generateRobotsTxt: true, // (optional)
    // Exclude specific paths if needed
    exclude: ['/admin/*'],
    robotsTxtOptions: {
      additionalSitemaps: [
        'https://trueconfess.com/sitemap.xml',
        // Add additional sitemaps if needed
      ],
    },
  };
  