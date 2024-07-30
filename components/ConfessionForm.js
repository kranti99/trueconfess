'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '/firebase';
import { FaCheckCircle } from 'react-icons/fa';
import AuthForm from '@components/AuthForm';

// Import ReactQuill dynamically
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.bubble.css';

// Import quill-emoji
import 'quill-emoji/dist/quill-emoji.css';
import { Quill } from 'react-quill';
import Emoji from 'quill-emoji';

export default function ConfessionForm() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowModal(true);
      return;
    }
    try {
      await addDoc(collection(db, 'confessions'), {
        title,
        content,
        date: serverTimestamp(),
        userId: user.uid,
        nickname: isAnonymous ? 'Anonymous' : user.displayName || 'Anonymous',
        likes: 0,
        commentCount: 0,
      });
      setContent('');
      setTitle('');
      setShowForm(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error adding confession: ', error);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) {
      setShowModal(true);
      return;
    }
    try {
      await addDoc(collection(db, 'drafts'), {
        title,
        content,
        date: serverTimestamp(),
        userId: user.uid,
        nickname: isAnonymous ? 'Anonymous' : user.displayName || 'Anonymous',
        likes: 0,
        commentCount: 0,
        isDraft: true,
      });
      setContent('');
      setTitle('');
      setShowForm(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error saving draft: ', error);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{ size: [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['emoji'],
      ['clean']
    ],
    "emoji-toolbar": true,
    "emoji-textarea": true,
    "emoji-shortname": true,
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white">
      {!showForm ? (
        <textarea
          onClick={() => {
            if (!user) {
              setShowModal(true);
              return;
            }
            setShowForm(true);
          }}
          placeholder="Post a confession..."
          className="w-full p-2 border border-gray-300 rounded bg-gray-700 text-white"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full p-2 focus:border-none border-b border-b-gray-300 bg-transparent rounded text-white placeholder-gray-300::placeholder"
            required
          />
          <div className="relative">
            <ReactQuill
              value={content}
              onChange={setContent}
              placeholder="Write your confession..."
              className="bg-gray-800 text-white placeholder-gray-300::placeholder"
              theme="bubble"
              modules={modules}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="mr-2"
            />
            <label htmlFor="anonymous">Post anonymously</label>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Save Draft
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Post
            </button>
          </div>
        </form>
      )}
      {showModal && <AuthForm closeModal={() => setShowModal(false)} />}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded flex items-center">
          <FaCheckCircle className="mr-2" />
          <span>Confession posted successfully!</span>
        </div>
      )}
    </div>
  );
}
