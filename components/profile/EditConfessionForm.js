import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

export default function EditConfessionForm({
  title,
  setTitle,
  content,
  setContent,
  age,
  setAge,
  location,
  setLocation,
  gender,
  setGender,
  tags,
  setTags,
  categories,
  setCategories,
  displayName,
  setDisplayName,
  onSave,
  onCancel,
  tagsOptions,
  categoriesOptions,
}) {
  const [isAnonymous, setIsAnonymous] = useState(!displayName);
  const [error, setError] = useState(null);

  const tagPattern = /^[a-zA-Z0-9]+$/;

  const validateFields = () => {
    if (!title || title.length > 100) {
      setError('Title is required and should not exceed 100 characters.');
      return false;
    }
    if (!content || content.length > 1000) {
      setError('Content is required and should not exceed 1000 characters.');
      return false;
    }
    if (age && (isNaN(age) || age < 0 || age > 150)) {
      setError('Please enter a valid age between 0 and 150.');
      return false;
    }
    if (tags.some((tag) => !tagPattern.test(tag.label))) {
      setError('Tags should not contain special characters or spaces.');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (validateFields()) {
      onSave();
    }
  };

  const handleTagChange = (newValue) => {
    setTags(newValue.filter((tag) => tagPattern.test(tag.label)));
  };

  useEffect(() => {
    setError(null);
  }, [title, content, age, location, gender, tags, categories, displayName]);

  return (
    <div className="edit-confession-form p-4 bg-gray-800 text-white rounded-lg">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2" htmlFor="title">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength="100"
          className="w-full p-2 bg-gray-900 border border-gray-600 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2" htmlFor="content">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength="1000"
          rows="6"
          className="w-full p-2 bg-gray-900 border border-gray-600 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2" htmlFor="age">
          Age
        </label>
        <input
          type="number"
          id="age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          min="0"
          max="150"
          className="w-full p-2 bg-gray-900 border border-gray-600 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2" htmlFor="location">
          Location
        </label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength="100"
          className="w-full p-2 bg-gray-900 border border-gray-600 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2" htmlFor="gender">
          Gender
        </label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full p-2 bg-gray-900 border border-gray-600 rounded"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2" htmlFor="tags">
          Tags
        </label>
        <CreatableSelect
          id="tags"
          isMulti
          value={tags}
          onChange={handleTagChange}
          options={tagsOptions}
          className="w-full bg-gray-900 text-black"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2" htmlFor="categories">
          Categories
        </label>
        <Select
          id="categories"
          isMulti
          value={categories}
          onChange={setCategories}
          options={categoriesOptions}
          className="w-full bg-gray-900 text-black"
        />
      </div>
      <div className="mb-4 flex items-center">
        <label className="block text-gray-400 text-sm mr-2">Post as:</label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={isAnonymous}
              onChange={() => {
                setIsAnonymous(true);
                setDisplayName('');
              }}
              className="mr-1"
            />
            Anonymous
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={!isAnonymous}
              onChange={() => setIsAnonymous(false)}
              className="mr-1"
            />
            Nickname
          </label>
        </div>
      </div>
      {!isAnonymous && (
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2" htmlFor="displayName">
            Nickname
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength="30"
            className="w-full p-2 bg-gray-900 border border-gray-600 rounded"
          />
        </div>
      )}
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center"
        >
          <FaSave className="mr-2" /> Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded flex items-center"
        >
          <FaTimes className="mr-2" /> Cancel
        </button>
      </div>
    </div>
  );
}
