'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, serverTimestamp, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '/firebase';
import { FaCheckCircle } from 'react-icons/fa';
import AuthForm from '@components/AuthForm';
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ConfessionForm = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

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

  const fetchCategoriesAndTags = async () => {
    try {
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const tagsSnapshot = await getDocs(collection(db, 'tags'));

      const fetchedCategories = categoriesSnapshot.docs.map(doc => ({ value: doc.id, label: doc.data().name }));
      const fetchedTags = tagsSnapshot.docs.map(doc => ({ value: doc.id, label: doc.data().name }));

      setCategories(fetchedCategories);
      setTags(fetchedTags);
    } catch (error) {
      console.error('Error fetching categories and tags: ', error);
    }
  };

  useEffect(() => {
    fetchCategoriesAndTags();
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
        tags: selectedTags.map(tag => tag.value),
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
        tags: selectedTags.map(tag => tag.value),
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
      setSelectedCategories(categories.filter(category => draft.categories.includes(category.value)));
      setSelectedTags(draft.tags.map(tag => ({ value: tag, label: tag })));
    }
  }, [categories]);

  const handleCreateTag = async (inputValue) => {
    const newTag = { name: inputValue };
    const newTagDocRef = doc(collection(db, 'tags'));
    await setDoc(newTagDocRef, newTag);
    const newTagOption = { value: newTagDocRef.id, label: inputValue };
    setSelectedTags(prevTags => [...prevTags, newTagOption]);
    setTags(prevTags => [...prevTags, newTagOption]);
  };

  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}],
      [{ size: [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'align': [] }],
      ['emoji'],
      ['clean'],
    ],
    "emoji-toolbar": true,
    "emoji-textarea": true,
    "emoji-shortname": true,
  };

  return (
    <div className="p-6 bg-dark-background-light rounded-lg text-white shadow-md max-w-3xl mx-auto w-full">
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
                options={categories}
                onChange={setSelectedCategories}
                value={selectedCategories}
                isMulti
                placeholder="Select categories..."
                className="text-dark bg-black"
                filterOption={(option, inputValue) =>
                  option.label.toLowerCase().includes(inputValue.toLowerCase())
                }
              />
            </div>
            <div className="w-1/2">
              <CreatableSelect
                isMulti
                onChange={setSelectedTags}
                onCreateOption={handleCreateTag}
                value={selectedTags}
                options={tags}
                placeholder="Add tags..."
                className="text-dark"
              />
            </div>
          </div>
          <div className="inline-flex items-center m-0">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-300"
            />
            <label htmlFor="anonymous" className="ml-2 text-sm font-medium text-gray-400">Post as anonymous</label>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
          {showSuccessMessage && (
            <div className="flex items-center justify-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="text-green-500">Your confession was posted successfully!</span>
            </div>
          )}
        </form>
      )}
      {showModal && <AuthForm onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default ConfessionForm;
