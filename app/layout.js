import React from 'react';
import { Inter } from "next/font/google";
import Header from "../components/header/page";
import Footer from "../components/footer/page";
import LeftSidebar from '../components/LeftSidebar';
import "./globals.css";
import Head from 'next/head'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "True Confess | Confession Site",
  description: "A platform to share and read confessions. Share your anonymous confessions and read other's secrets on True Confess.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.trueconfess.com/',
    site_name: 'True Confess',
    // images: [
    //   {
    //     url: 'https://www.trueconfess.com/images/og-image.jpg',
    //     width: 1200,
    //     height: 630,
    //     alt: 'True Confess',
    //   }
    // ],
  },
  keywords: ['confessions', 'anonymous confessions', 'secrets', 'share confessions', 'True Confess'],
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  viewport: 'width=device-width, initial-scale=1.0',


};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       <head>
        <meta name="google-site-verification" content="YqBu1NmdPSIaYbA9gvZKILnfCH2CMUWMMcfgXJoPRu4" />
        {/* <!-- Google tag (gtag.js) --> */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-6LC27C3J8W"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-6LC27C3J8W');
        </script>
      </head>
      <body className={inter.className}>
        <Header />
        <div className='relative flex justify-center'>
        <LeftSidebar />
        <main className="container max-w-3xl mx-4 px-0 py-12 md:px-4">{children}</main>
        </div>
        <div id="modal-root"></div>
        <Footer />
      </body>
    </html>
  );
}
