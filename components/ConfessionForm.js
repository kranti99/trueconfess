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
import { displayName } from 'react-quill';

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
      [{ 'header': '1' }, { 'header': '2' }],
      [{ size: [] }],
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
        <div className="flex items-center bg-green-500 p-4 rounded mb-4">
          <FaCheckCircle className="mr-2" />
          <span>Your confession has been submitted successfully!</span>
        </div>
      )}
      {!showForm && (
        <div className="text-center">
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white focus:outline-none"
          >
            Write Confession
          </button>
        </div>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-2 bg-dark-background rounded border border-dark-border focus:outline-none text-white"
              maxLength={50}
              required
            />
          </div>
          <div>
            <ReactQuill
              value={content}
              onChange={setContent}
              placeholder="Write your confession here..."
              className="bg-dark-background text-white rounded border border-dark-border"
              modules={modules}
              theme="snow"
            />
          </div>
          <div>
            <Select
              options={categories}
              value={selectedCategories}
              onChange={setSelectedCategories}
              isMulti
              placeholder="Select Categories"
              styles={darkModeSelectStyles}
            />
          </div>
          <div>
            <CreatableSelect
              isMulti
              value={selectedTags}
              onChange={setSelectedTags}
              onCreateOption={handleCreateTag}
              options={tags}
              placeholder="Add or Select Tags"
              styles={darkModeSelectStyles}
            />
          </div>
          <div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full p-2 bg-dark-background rounded border border-dark-border focus:outline-none text-white"
              maxLength={30}
              required
            />
          </div>
          <div>
            <input
              type="text"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              placeholder="Gender"
              className="w-full p-2 bg-dark-background rounded border border-dark-border focus:outline-none text-white"
              maxLength={10}
              required
            />
          </div>
          <div>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age"
              className="w-full p-2 bg-dark-background rounded border border-dark-border focus:outline-none text-white"
              min={13}
              max={120}
              required
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="form-checkbox"
              />
              <span className="ml-2">Post as Anonymous</span>
            </label>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleSaveDraft}
              type="button"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-full text-white focus:outline-none"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white focus:outline-none"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      )}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
          <AuthForm onClose={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
};

export default ConfessionForm;
