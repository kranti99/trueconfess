'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { auth } from '/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import AuthForm from '@components/AuthForm';
import SearchComponent from '@components/header/SearchComponent';
import { FaUserCircle } from 'react-icons/fa';
import { throttle } from 'lodash';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  const controlHeader = useCallback(
    throttle(() => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    }, 200),
    [lastScrollY]
  );

  useEffect(() => {
    window.addEventListener('scroll', controlHeader);
    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [controlHeader]);

  return (
    <div>
    <header
      className={`bg-dark-background-light text-white relative top-0 w-full z-50 shadow-lg transition-transform duration-300 ${
        isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl mb:text-2xl font-bold text-red-600">
            TrueConfess
          </Link>
        </div>
        <div className="flex-1 mx-4">
          <SearchComponent />
        </div>
        <nav className="flex items-center space-x-4">
          {user ? (
            <div className="relative">
              <FaUserCircle
                aria-label="User Menu"
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
          ) : (
            <>
              <button
                aria-label="Login"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthForm(true);
                }}
                className="hover:text-gray-400"
              >
                Login
              </button>
              <button
                aria-label="Sign Up"
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
        </nav>
      </div>
      <div>
      
      </div>
    </header>
    {showAuthForm && (
       
            <AuthForm 
              closeModal={closeModal} 
              mode={authMode} 
              setMode={setAuthMode} 
            />
       
      )}
    </div>
  );
}
