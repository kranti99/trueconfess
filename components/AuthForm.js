import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function AuthForm({ closeModal, mode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await userCredential.user.updateProfile({ displayName: username });
        setMessage('Sign up successful!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('Login successful!');
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
      setMessage('Password reset email sent');
      setIsError(false);
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center">
      <div className="bg-dark p-4 rounded relative">
        <button onClick={closeModal} className="absolute top-2 right-2 text-light">X</button>
        <h1 className="text-xl mb-4 text-light">{mode === 'signup' ? 'Sign Up' : 'Login'}</h1>
        {!isForgotPassword ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="w-full p-2 border border-accent rounded text-black"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-2 border border-accent rounded text-black"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-2 border border-accent rounded text-black"
            />
            <button type="submit" className="px-4 py-2 bg-accent text-white rounded hover-accent">
              {mode === 'signup' ? 'Sign Up' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-2 border border-accent rounded text-black"
            />
            <button type="submit" className="px-4 py-2 bg-accent text-white rounded hover-accent">
              Reset Password
            </button>
          </form>
        )}
        {!isForgotPassword && mode !== 'signup' && (
          <button onClick={() => setIsForgotPassword(true)} className="mt-4 text-accent hover:underline">
            Forgot password?
          </button>
        )}
        {!isForgotPassword && (
          <button onClick={() => setIsForgotPassword(false)} className="mt-4 text-accent hover:underline">
            {mode === 'signup' ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
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
