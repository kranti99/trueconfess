import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore methods
import { db } from '/firebase';
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const darkModeInputStyles = "w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none";
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
  singleValue: (styles) => ({ ...styles, color: '#fff' }),
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

export default function EditConfessionForm({
  editingConfessionId, editingTitle, editingContent, editingAge, editingLocation, editingGender,
  editingTags, editingCategories, editingDisplayName, tags, categories, error, showSuccessMessage,
  setEditingTitle, setEditingContent, setEditingAge, setEditingLocation, setEditingGender,
  setEditingTags, setEditingCategories, setEditingDisplayName, handleSaveEdit, setEditingConfessionId,
  username, updateConfessionList
}) {
  const [newlyCreatedTags, setNewlyCreatedTags] = useState([]);

  const handleTitleChange = (e) => setEditingTitle(e.target.value.slice(0, 100)); // Limit title to 100 characters
  const handleContentChange = (value) => setEditingContent(value);
  const handleAgeChange = (e) => setEditingAge(Math.min(Math.max(e.target.value, 13), 120)); // Age limit 13-120
  const handleLocationChange = (e) => setEditingLocation(e.target.value.slice(0, 50)); // Limit location to 50 characters
  const handleGenderChange = (e) => setEditingGender(e.target.value);

  const handleTagsChange = (selectedOptions) =>
    setEditingTags(selectedOptions.map(option => option.value));

  const handleCategoriesChange = (selectedOptions) =>
    setEditingCategories(selectedOptions.map(option => option.value));

  const handleDisplayNameChange = (selectedOption) =>
    setEditingDisplayName(selectedOption.value);

  const handleCreateTag = async (inputValue) => {
    if (!/^[a-zA-Z0-9]+$/.test(inputValue)) {
      alert('Tags should only contain alphanumeric characters without spaces or special characters.');
      return;
    }
    const newTag = { name: inputValue };
    const newTagDocRef = doc(db, 'tags', inputValue);
    await setDoc(newTagDocRef, newTag);
    setNewlyCreatedTags(prevTags => [...prevTags, inputValue]); // Add the new tag to the local state
    setEditingTags(prevTags => [...prevTags, inputValue]); // Add the new tag to selected tags
  };

  const saveEditHandler = async () => {
    await handleSaveEdit(); // Call the original save function
    updateConfessionList(); // Trigger a refresh of the confession list
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">Title</label>
        <input
          type="text"
          value={editingTitle}
          onChange={handleTitleChange}
          className={darkModeInputStyles}
        />
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">Content</label>
        <ReactQuill
          value={editingContent}
          onChange={handleContentChange}
          className="bg-gray-700 rounded-lg text-white"
          modules={{
            toolbar: {
              container: [
                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
              ],
              handlers: {
                color: () => console.log('Color changed'),
              }
            }
          }}
        />
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">Age</label>
        <input
          type="number"
          value={editingAge}
          onChange={handleAgeChange}
          className={darkModeInputStyles}
          min="13"
          max="120"
        />
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">Location</label>
        <input
          type="text"
          value={editingLocation}
          onChange={handleLocationChange}
          className={darkModeInputStyles}
        />
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">Gender</label>
        <select
          value={editingGender}
          onChange={handleGenderChange}
          className={darkModeInputStyles}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">Tags</label>
        <CreatableSelect
          isMulti
          value={tags.filter(tag => editingTags.includes(tag.value) || newlyCreatedTags.includes(tag.value))}
          onChange={handleTagsChange}
          options={[...tags, ...newlyCreatedTags.map(tag => ({ value: tag, label: tag }))]}
          styles={darkModeSelectStyles}
          onCreateOption={handleCreateTag}
        />
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">Categories</label>
        <Select
          isMulti
          value={categories.filter(category => editingCategories.includes(category.value))}
          onChange={handleCategoriesChange}
          options={categories}
          styles={darkModeSelectStyles}
        />
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">Display Name</label>
        <Select
          value={{ value: editingDisplayName, label: editingDisplayName }}
          onChange={handleDisplayNameChange}
          options={[
            { value: 'anonymous', label: 'Anonymous' },
            { value: username, label: username },
          ]}
          styles={darkModeSelectStyles}
        />
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {showSuccessMessage && <p className="text-green-500 mt-4">Confession updated successfully!</p>}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setEditingConfessionId(null)}
          className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={saveEditHandler}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  );
}
