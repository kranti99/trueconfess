'use client';

import React, { useState, useEffect } from 'react';
import { FaHome, FaSearch, FaPlus, FaThList, FaUserCircle } from 'react-icons/fa';
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
  const [showDropdown, setShowDropdown] = useState(false);

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

  const truncatedDisplayName = user?.nickname?.length > 8 
    ? `${user.nickname.slice(0, 8)}...` 
    : user?.nickname;

  return (
    <aside className="bg-dark-background border-r-2 border-white text-white md:w-24 md:h-screen md:p-8 md:fixed md:top-0 md:left-0 md:flex md:flex-col md:items-center md:justify-center w-full fixed bottom-0 p-4 flex justify-center md:justify-start items-center space-x-8 md:space-x-0 md:space-y-8 z-40">
      <nav className="flex md:flex-col md:space-y-8 space-x-6 md:space-x-0">
        <Link href="/" className="flex flex-col items-center space-y-1 hover:text-gray-400">
          <FaHome size={20} />
          <span className="text-xs md:text-sm">Home</span>
        </Link>
        <Link href="/explore" className="flex flex-col items-center space-y-1 hover:text-gray-400">
          <FaSearch size={20} />
          <span className="text-xs md:text-sm">Explore</span>
        </Link>
        <Link href="/upload" className="flex flex-col items-center space-y-1 hover:text-gray-400">
          <FaPlus size={20} className="text-purple-500" />
          <span className="text-xs md:text-sm">Upload</span>
        </Link>
        <Link href="/category" className="flex flex-col items-center space-y-1 hover:text-gray-400">
          <FaThList size={20} />
          <span className="text-xs md:text-sm">Categories</span>
        </Link>
        {user ? (
          <div className="md:relative flex flex-col items-center space-y-1">
            <FaUserCircle
              size={20}
              className="cursor-pointer hover:text-gray-400"
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
              <div className="fixed bottom-[80px] right-[15px] md:absolute md:right-auto md:left-24 md:-translate-x-1/2 mt-2 w-48 bg-white text-black rounded shadow-lg z-50" style={{ height:'fit-content' }}
>
                <Link
                  href="/profile"
                  className="block px-4 py-2 hover:bg-gray-200 text-black"
                >
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-200 text-black"
                >
                  Logout
                </button>
              </div>
            )}
            <span className="text-xs md:text-sm cursor-pointer hover:text-gray-400" onClick={() => setShowDropdown(!showDropdown)}>
              {truncatedDisplayName}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-1">
            <FaUserCircle size={20} className="cursor-pointer hover:text-gray-400" onClick={() => { setAuthMode('login'); setShowAuthForm(true); }} />
            <span className="text-xs md:text-sm cursor-pointer hover:text-gray-400" onClick={() => { setAuthMode('login'); setShowAuthForm(true); }}>
              Log in
            </span>
          </div>
        )}
      </nav>
      {showAuthForm && <AuthForm closeModal={closeModal} mode={authMode} setMode={setAuthMode} />}
    </aside>
  );
};

export default LeftSidebar;
