'use client';

import React, { useState, useEffect } from 'react';
import { FaHome, FaSearch, FaPlus, FaThList, FaUser } from 'react-icons/fa';
import Link from 'next/link';
import { auth } from '/firebase';
import { signOut } from 'firebase/auth';
import AuthForm from '@components/AuthForm';
import { useRouter } from 'next/navigation';

const LeftSidebar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

  const closeModal = () => {
    setShowAuthForm(false);
  };

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
        <Link href="/upload" className="flex flex-col items-center space-y-2 hover:text-gray-400">
          <FaPlus size={24} className="text-purple-500" />
          <span className="text-sm">Upload</span>
        </Link>
        <Link href="/category" className="flex flex-col items-center space-y-2 hover:text-gray-400">
          <FaThList size={24} />
          <span className="text-sm">Categories</span>
        </Link>
        {user ? (
          <div className="flex flex-col items-center space-y-2">
            <FaUser size={24} className="cursor-pointer hover:text-gray-400" onClick={handleLogout} />
            <span className="text-sm cursor-pointer hover:text-gray-400" onClick={handleLogout}>
              Logout
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <FaUser size={24} className="cursor-pointer hover:text-gray-400" onClick={() => { setAuthMode('login'); setShowAuthForm(true); }} />
            <span className="text-sm cursor-pointer hover:text-gray-400" onClick={() => { setAuthMode('login'); setShowAuthForm(true); }}>
              Log in
            </span>
          </div>
        )}
      </nav>
      {showAuthForm && <AuthForm closeModal={closeModal} mode={authMode} />}
    </aside>
  );
};

export default LeftSidebar;
