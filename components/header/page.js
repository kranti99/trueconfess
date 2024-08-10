'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import AuthForm from '@components/AuthForm';
import SearchComponent from '@components/header/SearchComponent';
import { FaHome, FaUserCircle, FaBell, FaGlobe } from 'react-icons/fa';

export default function Header() {
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

  return (
    <header className="bg-dark-background-light text-white fixed top-0 w-full z-50 shadow-lg">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-2xl font-bold text-red-600">
            TrueConfess
          </Link>
          <FaHome className="text-2xl cursor-pointer hover:text-gray-400" />
        </div>
        <div className="flex-1 mx-4">
          <SearchComponent />
        </div>
        <nav className="flex items-center space-x-4">
          <FaBell className="text-2xl cursor-pointer hover:text-gray-400" />
          {user ? (
            <>
              <div className="relative">
                <FaUserCircle
                  className="text-2xl cursor-pointer hover:text-gray-400"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-200"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthForm(true);
                }}
                className="hover:text-gray-400"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthForm(true);
                }}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
              >
                Sign Up
              </button>
            </>
          )}
          <FaGlobe className="text-2xl cursor-pointer hover:text-gray-400" />
        </nav>
      </div>
      {showAuthForm && (
        <AuthForm 
          closeModal={closeModal} 
          mode={authMode} 
          setMode={setAuthMode} // Pass setMode as a prop
        />
      )}
    </header>
  );
}
