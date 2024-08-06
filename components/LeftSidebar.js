import React from 'react';
import { FaHome, FaSearch, FaPlus, FaThList, FaUser } from 'react-icons/fa';
import Link from 'next/link';

const LeftSidebar = () => {
  return (
    <aside className="invisible md:visible bg-dark-background border-r-2 border-white text-white w-24 h-screen p-8 fixed top-0 left-0 z-40 flex flex-col items-center space-y-8">
      <div className="text-4xl font-bold text-pink-500 mb-12">RG</div>
      <nav className="flex flex-col space-y-8">
        <Link href="/" className="flex flex-col items-center space-y-2 hover:text-gray-400">
          <FaHome size={24} />
          <span className="text-sm">Home</span>
        </Link>
        <Link href="#" className="flex flex-col items-center space-y-2 hover:text-gray-400">
          <FaSearch size={24} />
          <span className="text-sm">Explore</span>
        </Link>
        <Link href="#" className="flex flex-col items-center space-y-2 hover:text-gray-400">
          <FaPlus size={24} className="text-purple-500" />
          <span className="text-sm">Upload</span>
        </Link>
        <Link href="/categories" className="flex flex-col items-center space-y-2 hover:text-gray-400">
          <FaThList size={24} />
          <span className="text-sm">Categories</span>
        </Link>
        <Link href="#" className="flex flex-col items-center space-y-2 hover:text-gray-400">
          <FaUser size={24} />
          <span className="text-sm">Log in</span>
        </Link>
      </nav>
    </aside>
  );
};

export default LeftSidebar;
