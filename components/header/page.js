'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import AuthForm from '@components/AuthForm';
import SearchComponent from '@components/header/SearchComponent';
import { FaUserCircle } from 'react-icons/fa';

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
    <header className="bg-dark text-light p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        TrueConfess
      </Link>
      <div className="flex-1 mx-4 flex justify-center">
        <SearchComponent />
      </div>
      <nav className="flex items-center">
        <Link href="/" className="mr-4 hover:underline">
          Home
        </Link>
        {user ? (
          <>
            <div className="relative">
              <FaUserCircle
                className="text-2xl cursor-pointer hover:text-gray-400"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-200">
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
              className="mr-4 hover:underline"
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setShowAuthForm(true);
              }}
              className="bg-green-500 px-3 py-1 rounded hover:bg-green-700"
            >
              Sign Up
            </button>
          </>
        )}
      </nav>
      {showAuthForm && <AuthForm closeModal={closeModal} mode={authMode} />}
    </header>
  );
}
