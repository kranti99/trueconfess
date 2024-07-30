// components/Footer.js
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <p>&copy; {new Date().getFullYear()} Confession Site. All rights reserved.</p>
      
    </footer>
  );
}
