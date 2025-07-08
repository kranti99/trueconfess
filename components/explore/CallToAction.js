import React from 'react';
import Link from 'next/link';

const CallToAction = () => (
  <section className="cta mt-8 mb-12 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg text-center hover:from-pink-500 hover:to-red-500 transition-all duration-300">
    <h2 className="text-3xl font-bold mb-4">Share Your Confession</h2>
    <p className="mb-6 text-lg">Got something on your mind? Don't keep it to yourself, share it with the world!</p>
    <Link href="/post" className="px-8 py-3 bg-white text-indigo-500 font-bold rounded-full shadow-md hover:bg-indigo-600 hover:text-white transition-all duration-300">
      Share Your Confession
    </Link>
  </section>
);

export default CallToAction;
