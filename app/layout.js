import React from 'react';
import { Inter } from "next/font/google";
import Header from "../components/header/page";
import Footer from "../components/footer/page";
import LeftSidebar from '../components/LeftSidebar';
import "./globals.css";
import Head from 'next/head';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "True Confess | Confession Site",
  description: "A platform to share and read confessions. Share your anonymous confessions and read other's secrets on True Confess.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.trueconfess.com/',
    site_name: 'True Confess',
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
      <Head>
        <meta name="google-site-verification" content="YqBu1NmdPSIaYbA9gvZKILnfCH2CMUWMMcfgXJoPRu4" />
      </Head>
      <body className={inter.className}>
        <Header />
        <div className='relative flex justify-center'>
          <LeftSidebar />
          <main className="container max-w-3xl md:mx-4 px-0 md:py-12 md:px-4">{children}</main>
        </div>
        <div id="modal-root"></div>
        <Footer />

        {/* Google Analytics */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-6LC27C3J8W"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6LC27C3J8W');
          `}
        </Script>
      </body>
    </html>
  );
}
