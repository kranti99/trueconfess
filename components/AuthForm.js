'use client';

import React, { useState } from 'react';
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '/firebase';

export default function AuthForm({ closeModal, mode, setMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();

  // Predefined avatars list
  const avatars = [
    '/avatars/male1.png',
    '/avatars/male2.png',
    '/avatars/female1.png',
    '/avatars/female2.png',
  ];

  // Function to generate a random nickname
  const generateRandomNickname  = async () => {
    let nickname;
    let docSnap;
  
    do {
      const adjectives = ["Cool", "Swift", "Mighty", "Brave", "Quick"];
      const animals = ["Lion", "Eagle", "Shark", "Panther", "Tiger"];
      nickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${animals[Math.floor(Math.random() * animals.length)]}`;
  
      const docRef = doc(db, 'users', nickname);
      docSnap = await getDoc(docRef);
    } while (docSnap.exists());
  
    return nickname;
  };

  // Function to select a random avatar
  const getRandomAvatar = () => {
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setMessage('Login via Google successful! Redirecting...');
      setTimeout(() => closeModal(), 1500); // Close modal after showing success message
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
  
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const randomNickname = await generateRandomNickname(); // Ensure to await the nickname generation
        const randomAvatar = getRandomAvatar();
  
        // Update profile with random nickname and avatar
        await updateProfile(userCredential.user, { displayName: randomNickname, photoURL: randomAvatar });
  
        // Save user data to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          nickname: randomNickname,
          avatar: randomAvatar,
          email: userCredential.user.email,
        });
  
        setMessage('Sign up successful! Redirecting...');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('Login successful! Redirecting...');
      }
      setTimeout(() => closeModal(), 1500); // Close modal after showing success message
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };
  

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent successfully.');
      setMode('login');
    } catch (error) {
      setIsError(true);
      setMessage('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
      <div className="bg-gray-800 p-6 rounded-lg relative shadow-lg w-full max-w-md">
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-gray-300 hover:text-white"
          aria-label="Close"
        >
          X
        </button>
        <h1 className="text-2xl mb-4 text-white">
          {mode === 'signup' ? 'Sign Up' : mode === 'login' ? 'Login' : 'Reset Password'}
        </h1>

        {!showEmailForm ? (
          <>
            <button
              onClick={handleGoogleLogin}
              className="w-full px-4 py-2 mb-4 bg-red-600 text-white rounded hover:bg-red-700 transition"
              aria-label="Login with Google"
            >
              Login via Google
            </button>
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full px-4 py-2 mb-4 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              aria-label="Continue with Email"
            >
              Continue with Email
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <input
                type="text"
                value={generateRandomNickname()} // Generate and show random nickname (user won't see it)
                disabled
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
                aria-label="Username"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
              aria-label="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
              aria-label="Password"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              aria-label={mode === 'signup' ? 'Sign Up' : 'Login'}
            >
              {mode === 'signup' ? 'Sign Up' : 'Login'}
            </button>
          </form>
        )}

        {mode === 'login' && showEmailForm && (
          <button
            onClick={() => setMode('reset')}
            className="mt-4 text-blue-400 hover:text-blue-500"
            aria-label="Forgot password"
          >
            Forgot password?
          </button>
        )}

        {showEmailForm && (
          <button
            className="mt-4 text-blue-400 hover:text-blue-500"
            onClick={() => setMode(mode === 'signup' ? 'login' : mode === 'login' ? 'signup' : 'login')}
            aria-label={mode === 'signup' ? 'Switch to Login' : 'Switch to Sign Up'}
          >
            {mode === 'signup'
              ? 'Already a member? Login here'
              : mode === 'login'
              ? "Don't have an account? Sign up here"
              : 'Back to Login'}
          </button>
        )}

        {message && (
          <p className={`mt-4 ${isError ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
