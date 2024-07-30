import React from 'react';
import { Inter } from "next/font/google";
import Header from "../components/header/page";
import Footer from "../components/footer/page";
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
        <main className="container mx-auto px-4 py-8">{children}</main>
        <div id="modal-root"></div>
        <Footer />
      </body>
    </html>
  );
}
