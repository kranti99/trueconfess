'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getAuth, signOut } from 'firebase/auth';
import { addDoc, collection, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '/firebase';
import { useRouter } from 'next/navigation';
import AuthForm from '@components/AuthForm';
import * as Emoji from "quill-emoji";

import 'react-quill/dist/quill.bubble.css';
import 'quill-emoji/dist/quill-emoji.css';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function CommentForm({ confessionId, replyTo }) {
  const [content, setContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const auth = getAuth();
  const MAX_WORD_COUNT = 200; // Set your word limit here
  const MAX_SINGLE_WORD_LENGTH = 50; // Limit for single-word length

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

  const closeModal = () => {
    setShowAuthForm(false);
  };

  useEffect(() => {
    let Quill;
    let EmojiBlot;
    let ShortNameEmoji;
    let ToolbarEmoji;

    if (typeof window !== 'undefined') {
      Quill = require('react-quill').Quill;
      EmojiBlot = require('quill-emoji').EmojiBlot;
      ShortNameEmoji = require('quill-emoji').ShortNameEmoji;
      ToolbarEmoji = require('quill-emoji').ToolbarEmoji;

      if (Quill) {
        Quill.register("modules/emoji", Emoji);
      }
    }
  }, []);

  const validateComment = () => {
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount > MAX_WORD_COUNT) {
      setErrorMessage(`Comment exceeds the maximum word limit of ${MAX_WORD_COUNT} words.`);
      return false;
    }

    const words = content.trim().split(/\s+/);
    for (let word of words) {
      if (word.length > MAX_SINGLE_WORD_LENGTH) {
        setErrorMessage(`Single word exceeds the maximum length of ${MAX_SINGLE_WORD_LENGTH} characters.`);
        return false;
      }
    }

    if (!content.trim()) {
      setErrorMessage('Comment cannot be empty.');
      return false;
    }

    return true;
  };

  const publishComment = async () => {
    if (!user) {
      setShowAuthForm(true);
      return;
    }

    if (!validateComment()) {
      return;
    }

    try {
      await addDoc(collection(db, 'confessions', confessionId, 'comments'), {
        content,
        date: serverTimestamp(),
        userId: user.uid,
        nickname: isAnonymous ? 'Anonymous' : user.displayName,
        replyTo: replyTo || null,
      });
      await updateDoc(doc(db, 'confessions', confessionId), {
        commentCount: increment(1),
      });
      setContent('');
      setIsFocused(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error adding comment: ', error);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['emoji'],
      ['clean']
    ],
    'emoji-toolbar': true,
    'emoji-textarea': true,
    'emoji-shortname': true,
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md relative">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex-1 flex flex-col">
            <div className="editor-container border border-gray-700 rounded-lg p-2 flex flex-col">
              <ReactQuill
                value={content}
                onChange={setContent}
                modules={modules}
                theme="bubble"
                placeholder="Add a comment..."
                className="text-white placeholder-white"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(content ? true : false)}
              />
              {isFocused && (
                <div className="mt-2 flex justify-between items-center">
                  <div>
                    <label className="text-white flex items-center">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="mr-2"
                      />
                      Post as Anonymous
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={publishComment}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm"
                  >
                    Publish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {errorMessage && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white p-4 rounded flex items-center">
          <FaExclamationCircle className="mr-2" />
          <span>{errorMessage}</span>
        </div>
      )}

      {showAuthForm && (
        <AuthForm closeModal={closeModal} mode={authMode} setMode={setAuthMode} />
      )}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded flex items-center">
          <FaCheckCircle className="mr-2" />
          <span>Comment posted successfully!</span>
        </div>
      )}
    </div>
  );
}
