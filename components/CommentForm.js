'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '/firebase';

import AuthForm from '@components/AuthForm';

import 'react-quill/dist/quill.bubble.css';
import 'quill-emoji/dist/quill-emoji.css';
import { FaCheckCircle } from 'react-icons/fa';
import { Quill } from 'react-quill';
import { EmojiBlot, ShortNameEmoji, ToolbarEmoji } from 'quill-emoji';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function CommentForm({ confessionId, replyTo }) {
  const [content, setContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  const publishComment = async () => {
    if (!user) {
      setShowModal(true);
      return;
    }
    try {
      await addDoc(collection(db, 'confessions', confessionId, 'comments'), {
        content,
        date: serverTimestamp(),
        userId: user.uid,
        nickname: user.displayName,
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
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
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
                <div className="mt-2 flex justify-end">
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
      {showModal && <AuthForm closeModal={() => setShowModal(false)} />}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded flex items-center">
          <FaCheckCircle className="mr-2" />
          <span>Comment posted successfully!</span>
        </div>
      )}
    </div>
  );
}
