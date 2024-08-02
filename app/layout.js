import React from 'react';
import { Inter } from "next/font/google";
import Header from "../components/header/page";
import Footer from "../components/footer/page";
import LeftSidebar from '../components/LeftSidebar';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Confession Site",
  description: "A platform to share and read confessions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
