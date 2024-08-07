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

const dot = (color = 'transparent') => ({
  alignItems: 'center',
  display: 'flex',

  ':before': {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: 10,
    width: 10,
  },
});

const darkModeSelectStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  }),
  option: (styles, { isDisabled, isFocused, isSelected }) => {
    const backgroundColor = isDisabled ? undefined : isSelected ? '#555' : isFocused ? '#444' : '#333';
    const color = isDisabled ? '#ccc' : isSelected ? '#fff' : '#ccc';
    return {
      ...styles,
      backgroundColor,
      color,
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled ? (isSelected ? '#555' : '#444') : undefined,
      },
    };
  },
  input: (styles) => ({ ...styles, color: '#fff' }),
  placeholder: (styles) => ({ ...styles, color: '#aaa', ...dot('#ccc') }),
  singleValue: (styles, { data }) => ({ ...styles, color: '#fff', ...dot(data.color) }),
  multiValue: (styles) => ({ ...styles, backgroundColor: '#444', color: '#fff' }),
  multiValueLabel: (styles) => ({ ...styles, color: '#fff' }),
  multiValueRemove: (styles) => ({
    ...styles,
    color: '#fff',
    ':hover': {
      backgroundColor: '#555',
      color: '#fff',
    },
  }),
};

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
              className="text-gray-400 hover:text-gray-200"
              onClick={() => setShowForm(false)}
            >
              X
            </button>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full p-3 border-b border-gray-700 bg-dark-background text-white focus:outline-none focus:border-blue-500 transition duration-300"
          />
          <ReactQuill
            value={content}
            onChange={(value) => setContent(value)}
            placeholder="Share your confession..."
            modules={modules}
            className="bg-dark-background-light text-white"
          />
          <div>
            <label className="block text-gray-400 mb-1">Categories</label>
            <Select
              isMulti
              value={selectedCategories}
              onChange={setSelectedCategories}
              options={categories}
              styles={darkModeSelectStyles}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select categories"
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary25: '#444',
                  primary: '#555',
                },
              })}
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Tags</label>
            <CreatableSelect
              isMulti
              value={selectedTags}
              onChange={setSelectedTags}
              onCreateOption={handleCreateTag}
              options={tags}
              styles={darkModeSelectStyles}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select or create tags"
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary25: '#444',
                  primary: '#555',
                },
              })}
            />
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="form-checkbox h-5 w-5 text-blue-600 bg-dark-background border-gray-600 rounded focus:outline-none"
            />
            <label htmlFor="anonymous" className="text-gray-400">Post as anonymous</label>
          </div>
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition duration-300"
              onClick={handleSaveDraft}
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition duration-300"
            >
              Post
            </button>
          </div>
        </form>
      )}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2 shadow-md">
          <FaCheckCircle />
          <span>Confession posted successfully!</span>
        </div>
      )}
      {showModal && (
        <AuthForm
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ConfessionForm;
