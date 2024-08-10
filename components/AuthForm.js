'use client';

import React, { useState } from 'react';
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

export default function AuthForm({ closeModal, mode, setMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
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

        {mode === 'reset' ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
              aria-label="Email for password reset"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              aria-label="Reset Password"
            >
              Reset Password
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
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

        {mode === 'login' && (
          <button
            onClick={() => setMode('reset')}
            className="mt-4 text-blue-400 hover:text-blue-500 underline"
            aria-label="Forgot password"
          >
            Forgot password?
          </button>
        )}

        <button
          className="mt-4 text-blue-400 hover:text-blue-500 underline"
          onClick={() => setMode(mode === 'signup' ? 'login' : mode === 'login' ? 'signup' : 'login')}
          aria-label={mode === 'signup' ? 'Switch to Login' : 'Switch to Sign Up'}
        >
          {mode === 'signup'
            ? 'Already a member? Login here'
            : mode === 'login'
            ? "Don't have an account? Sign up here"
            : 'Back to Login'}
        </button>

        {message && (
          <p className={`mt-4 ${isError ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
