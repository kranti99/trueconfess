'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, serverTimestamp, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '/firebase';
import { FaCheckCircle } from 'react-icons/fa';
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
  placeholder: (styles) => ({ ...styles, color: '#aaa' }),
  singleValue: (styles, { data }) => ({ ...styles, color: '#fff' }),
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
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');

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
        title: title.trim(),
        content,
        categories: selectedCategories.map(category => category.value),
        tags: selectedTags.map(tag => tag.value),
        date: serverTimestamp(),
        userId: user.uid,
        displayName: isAnonymous ? 'Anonymous' : user.displayName || 'Anonymous',
        likes: 0,
        commentCount: 0,
        location: location.trim(),
        gender,
        age: parseInt(age, 10),
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
        title: title.trim(),
        content,
        categories: selectedCategories.map(category => category.value),
        tags: selectedTags.map(tag => tag.value),
        date: serverTimestamp(),
        userId: user.uid,
        displayName: isAnonymous ? 'Anonymous' : user.displayName || 'Anonymous',
        likes: 0,
        commentCount: 0,
        isDraft: true,
        location: location.trim(),
        gender,
        age: parseInt(age, 10),
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
    if (!/^[a-zA-Z0-9]+$/.test(inputValue)) {
      alert('Tags should only contain alphanumeric characters without spaces or special characters.');
      return;
    }
    const newTag = { name: inputValue };
    const newTagDocRef = doc(db, 'tags', inputValue); // Use tag name as the document ID
    await setDoc(newTagDocRef, newTag);
    const newTagOption = { value: inputValue, label: inputValue };
    setSelectedTags(prevTags => [...prevTags, newTagOption]);
    setTags(prevTags => [...prevTags, newTagOption]);
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (showForm && (title || content)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showForm, title, content]);

  const modules = {
    toolbar: [
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
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
    <div className="p-6 bg-dark-background-light rounded-lg text-white shadow-md max-w-3xl mx-auto">
      {showSuccessMessage && (
        <div className="bg-green-500 text-white p-4 rounded-md mb-6 flex items-center">
          <FaCheckCircle className="mr-2" /> Confession posted successfully!
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-bold mb-2">Title</label>
          <input
            type="text"
            id="title"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-600"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100} // Limit the title length
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="categories" className="block text-sm font-bold mb-2">Categories</label>
          <Select
            id="categories"
            options={categories}
            isMulti
            value={selectedCategories}
            onChange={setSelectedCategories}
            styles={darkModeSelectStyles}
            className="text-dark-text" // This helps with the font color inside the select
            placeholder="Select categories..."
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary25: '#444',
                primary: '#666',
              },
            })}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-bold mb-2">Tags</label>
          <CreatableSelect
            id="tags"
            options={tags}
            isMulti
            value={selectedTags}
            onChange={setSelectedTags}
            onCreateOption={handleCreateTag}
            styles={darkModeSelectStyles}
            className="text-dark-text" // This helps with the font color inside the select
            placeholder="Select or create tags..."
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary25: '#444',
                primary: '#666',
              },
            })}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="gender" className="block text-sm font-bold mb-2">Gender</label>
          <select
            id="gender"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-600"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select gender (optional)</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="age" className="block text-sm font-bold mb-2">Age</label>
          <input
            type="number"
            id="age"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-600"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={0}
            placeholder="Enter age (optional)"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-bold mb-2">Location</label>
          <input
            type="text"
            id="location"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-600"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={100} // Limit the location length
            placeholder="Enter location (optional)"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-bold mb-2">Confession</label>
          <ReactQuill
            id="content"
            value={content}
            onChange={setContent}
            modules={modules}
            className="bg-gray-700 text-white rounded"
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-gray-600"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <span className="ml-2">Post as Anonymous</span>
          </label>
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isLoading}
          >
            {isLoading ? 'Posting...' : 'Post Confession'}
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </form>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-lg font-bold mb-4">Authentication Required</h2>
            <p className="mb-4">Please sign in to post your confession.</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfessionForm;
