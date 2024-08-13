import React from 'react';
import { Inter } from "next/font/google";
import Header from "../components/header/page";
import Footer from "../components/footer/page";
import LeftSidebar from '../components/LeftSidebar';
import "./globals.css";
import Head from 'next/head'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Confession Site",
  description: "A platform to share and read confessions",
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
        <main className="container max-w-3xl mx-4 px-0 py-12 md:px-4">{children}</main>
        </div>
        <div id="modal-root"></div>
        <Footer />
      </body>
    </html>
  );
}
