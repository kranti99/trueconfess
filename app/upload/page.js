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
  const [location, setLocation] = useState('');
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
    if (!title.trim() || !content.trim() || !location.trim()) {
      alert('Title, Content, and Location are required.');
      return;
    }
    try {
      setIsLoading(true);
      await addDoc(collection(db, 'confessions'), {
        title,
        content,
        location,
        categories: selectedCategories.map(category => category.value),
        tags: selectedTags.map(tag => tag.value),
        date: serverTimestamp(),
        userId: user.uid,
        nickname: isAnonymous ? 'Anonymous' : user.displayName || 'Anonymous',
        gender,
        age,
        likes: 0,
        commentCount: 0,
      });
      setContent('');
      setTitle('');
      setLocation('');
      setGender('');
      setAge('');
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
    if (!title.trim() || !content.trim() || !location.trim()) {
      alert('Title, Content, and Location are required.');
      return;
    }
    try {
      setIsLoading(true);
      const draft = {
        title,
        content,
        location,
        categories: selectedCategories.map(category => category.value),
        tags: selectedTags.map(tag => tag.value),
        date: serverTimestamp(),
        userId: user.uid,
        nickname: isAnonymous ? 'Anonymous' : user.displayName || 'Anonymous',
        gender,
        age,
        likes: 0,
        commentCount: 0,
        isDraft: true,
      };
      localStorage.setItem('draft', JSON.stringify(draft));
      await addDoc(collection(db, 'drafts'), draft);
      setContent('');
      setTitle('');
      setLocation('');
      setGender('');
      setAge('');
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
      setLocation(draft.location);
      setSelectedCategories(categories.filter(category => draft.categories.includes(category.value)));
      setSelectedTags(draft.tags.map(tag => ({ value: tag, label: tag })));
      setGender(draft.gender);
      setAge(draft.age);
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
    <div className="p-6 bg-dark-background-light rounded-lg text-white shadow-md max-w-3xl mx-auto w-full mt-32">
        <h2 className="text-3xl font-bold my-4">Post Confession</h2>
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
          className="w-full h-24 p-4 bg-dark-background text-white border border-gray-700 rounded-lg resize-none focus:outline-none focus:border-indigo-500"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-2 bg-dark-background text-white border-b border-gray-700 focus:outline-none"
            />
          </div>
          
          <div className="bg-dark-background-light p-2 border border-gray-700 rounded-lg">
            <ReactQuill
              value={content}
              onChange={setContent}
              placeholder="Write your confession here..."
              modules={modules}
              className="text-white"
              theme="snow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Categories</label>
            <Select
              isMulti
              value={selectedCategories}
              onChange={setSelectedCategories}
              options={categories}
              styles={darkModeSelectStyles}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Tags</label>
            <CreatableSelect
              isMulti
              value={selectedTags}
              onChange={setSelectedTags}
              onCreateOption={handleCreateTag}
              options={tags}
              styles={darkModeSelectStyles}
            />
          </div>
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-300 mr-2">Anonymous</label>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="form-checkbox h-5 w-5 text-indigo-600 bg-dark-background-light border-gray-600"
            />
          </div>
          <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-300 mr-2">Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full p-2 bg-dark-background text-white border-b border-gray-700 focus:outline-none"
            />
          </div>
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-300 mr-2">Gender:</label>
            <input
              type="text"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              placeholder="Gender"
              className="w-full p-2 bg-dark-background text-white border-b border-gray-700 focus:outline-none"
            />
          </div>
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-300 mr-2">Age: </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age"
              className="w-full p-2 bg-dark-background text-white border-b border-gray-700 focus:outline-none"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Posting...' : 'Post Confession'}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {isLoading ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
          <FaCheckCircle />
          <span>Confession successfully posted!</span>
        </div>
      )}
      {showModal && <AuthForm onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default ConfessionForm;
