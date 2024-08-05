'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '/firebase';
import { FaCheckCircle } from 'react-icons/fa';
import AuthForm from '@components/AuthForm';
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const predefinedCategories = [
  { value: 'general', label: 'General' },
  { value: 'confessions', label: 'Confessions' },
  { value: 'advice', label: 'Advice' },
  { value: 'humor', label: 'Humor' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'work', label: 'Work' },
  { value: 'family', label: 'Family' },
  { value: '18+', label: '18+' },
  { value: 'health', label: 'Health' },
  { value: 'school', label: 'School' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'travel', label: 'Travel' },
  { value: 'food', label: 'Food' },
  { value: 'news', label: 'News' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'science', label: 'Science' },
  { value: 'politics', label: 'Politics' },
  { value: 'culture', label: 'Culture' },
  { value: 'history', label: 'History' },
  { value: 'nature', label: 'Nature' },
  { value: 'music', label: 'Music' },
  { value: 'art', label: 'Art' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'personal', label: 'Personal' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'finance', label: 'Finance' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'memes', label: 'Memes' },
  { value: 'gaming', label: 'Gaming' },
];

const ConfessionForm = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

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
        Quill.register("modules/emoji", {
          EmojiBlot,
          ShortNameEmoji,
          ToolbarEmoji,
        });
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowModal(true);
      return;
    }
    try {
      setIsLoading(true);
      await addDoc(collection(db, 'confessions'), {
        title,
        content,
        categories: selectedCategories.map(category => category.value),
        tags: tags.map(tag => tag.value),
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) {
      setShowModal(true);
      return;
    }
    try {
      setIsLoading(true);
      const draft = {
        title,
        content,
        categories: selectedCategories.map(category => category.value),
        tags: tags.map(tag => tag.value),
        date: serverTimestamp(),
        userId: user.uid,
        nickname: isAnonymous ? 'Anonymous' : user.displayName || 'Anonymous',
        likes: 0,
        commentCount: 0,
        isDraft: true,
      };
      localStorage.setItem('draft', JSON.stringify(draft));
      await addDoc(collection(db, 'drafts'), draft);
      setContent('');
      setTitle('');
      setShowForm(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error saving draft: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedDraft = localStorage.getItem('draft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setTitle(draft.title);
      setContent(draft.content);
      setSelectedCategories(predefinedCategories.filter(category => draft.categories.includes(category.value)));
      setTags(draft.tags.map(tag => ({ value: tag, label: tag })));
    }
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}],
      [{ size: [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'align': [] }],
      ['clean']
    ],
    "emoji-toolbar": true,
    "emoji-textarea": true,
    "emoji-shortname": true,
  };

  return (
    <div className="p-6 bg-dark-background-light rounded-lg text-white shadow-md max-w-3xl mx-auto">
      {!showForm ? (
        <textarea
          onClick={() => {
            if (!user) {
              setShowModal(true);
              return;
            }
            setShowForm(true);
          }}
          placeholder="Post your confession..."
          className="w-full p-3 border border-gray-700 rounded-lg bg-dark-background text-white focus:outline-none focus:border-blue-500 transition duration-300"
        />
      ) : (
        <form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Create Post</h2>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300"
              disabled={isLoading}
            >
              Save Draft
            </button>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full p-3 border border-gray-700 bg-dark-background text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition duration-300"
            required
          />
          <div className="relative">
            <ReactQuill
              value={content}
              onChange={setContent}
              placeholder="Write your confession..."
              className="bg-dark-background text-white placeholder:text-white placeholder:italic h-40"
              theme="snow"
              modules={modules}
            />
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <Select
                options={predefinedCategories}
                onChange={setSelectedCategories}
                value={selectedCategories}
                placeholder="Select Categories"
                isMulti
                className="text-black"
              />
            </div>
            <div className="w-1/2">
              <CreatableSelect
                isMulti
                onChange={setTags}
                value={tags}
                placeholder="Add Tags"
                className="text-black bg-black"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="w-4 h-4 mb-0 text-blue-500 bg-gray-800 border-gray-700 focus:ring-blue-500 rounded transition duration-300"
            />
            <label htmlFor="anonymous" className="text-gray-400">Post as Anonymous</label>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition duration-300"
              disabled={isLoading}
            >
              Post
            </button>
          </div>
          {showSuccessMessage && (
            <div className="flex items-center space-x-2 text-green-400">
              <FaCheckCircle />
              <span>Post submitted successfully!</span>
            </div>
          )}
        </form>
      )}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg max-w-md mx-auto">
            <AuthForm closeModal={() => setShowModal(false)} />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition duration-300"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfessionForm;
