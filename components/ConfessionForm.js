'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '/firebase';
import { FaCheckCircle } from 'react-icons/fa';
import AuthForm from '@components/AuthForm';
import 'react-quill/dist/quill.bubble.css';
import 'quill-emoji/dist/quill-emoji.css';
import { EmojiBlot, ShortNameEmoji, ToolbarEmoji } from 'quill-emoji';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
    <div className="p-6 bg-gray-800 rounded-lg text-white shadow-md">
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
          className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition duration-300"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full p-3 border-b-2 border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition duration-300"
            required
          />
          <div className="relative">
            <ReactQuill
              value={content}
              onChange={setContent}
              placeholder="Write your confession..."
              className="bg-gray-800 text-white placeholder:text-slate-400 placeholder:italic"
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
            <label htmlFor="anonymous" className="cursor-pointer">Post anonymously</label>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition duration-300"
            >
              Save Draft
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition duration-300">
              Post Confession
            </button>
          </div>
          
        </form>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg p-8 max-w-lg mx-auto relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400">&times;</button>
            <AuthForm closeModal={() => setShowModal(false)} mode="login" />
          </div>
        </div>
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
