import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '/firebase';
import dynamic from 'next/dynamic';
import { FaThumbsUp, FaComment } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import EditDropDown from './EditDropDown';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
const Avatar = dynamic(() => import('react-avatar'), { ssr: false });
const TimeAgo = dynamic(() => import('@components/TimeAgo'), { ssr: false });

export default function MyConfessionList({ user }) {
  const [confessions, setConfessions] = useState([]);
  const [editingConfessionId, setEditingConfessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [editingAge, setEditingAge] = useState('');
  const [editingLocation, setEditingLocation] = useState('');
  const [editingGender, setEditingGender] = useState('');
  const [editingTags, setEditingTags] = useState([]);
  const [editingCategory, setEditingCategory] = useState([]);
  const [editingDisplayName, setEditingDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showMore, setShowMore] = useState({});
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const confessionsPerPage = 5;

  useEffect(() => {
    const fetchUserConfessions = async () => {
      if (user) {
        try {
          const q = query(collection(db, 'confessions'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const userConfessions = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setConfessions(userConfessions);
        } catch (error) {
          console.error('Error fetching user confessions:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserConfessions();
  }, [user]);

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

  useEffect(() => {
    const fetchTagsAndCategories = async () => {
      try {
        const tagsSnapshot = await getDocs(collection(db, 'tags'));
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));

        const fetchedTags = tagsSnapshot.docs.map((doc) => ({
          value: doc.id,
          label: doc.data().name,
        }));
        const fetchedCategories = categoriesSnapshot.docs.map((doc) => ({
          value: doc.id,
          label: doc.data().name,
        }));

        setTags(fetchedTags);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching tags and categories:', error);
      }
    };

    fetchTagsAndCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'confessions', id));
      setConfessions(confessions.filter((confession) => confession.id !== id));
    } catch (error) {
      console.error('Error deleting confession:', error);
    }
  };

  const handleEditClick = (confession) => {
    setEditingConfessionId(confession.id);
    setEditingTitle(confession.title);
    setEditingContent(confession.content);
    setEditingAge(confession.age);
    setEditingLocation(confession.location);
    setEditingGender(confession.gender);
    setEditingTags(confession.tags || []);
    setEditingCategory(confession.category || []);
    setEditingDisplayName(confession.displayName || '');
  };

  const handleSaveEdit = async () => {
    if (validateFields()) {
      try {
        const confessionRef = doc(db, 'confessions', editingConfessionId);
        await updateDoc(confessionRef, {
          title: editingTitle,
          content: editingContent,
          age: editingAge,
          location: editingLocation,
          gender: editingGender,
          tags: editingTags,
          category: editingCategory,
          displayName: editingDisplayName,
        });

        setConfessions((prevConfessions) =>
          prevConfessions.map((confession) =>
            confession.id === editingConfessionId
              ? {
                  ...confession,
                  title: editingTitle,
                  content: editingContent,
                  age: editingAge,
                  location: editingLocation,
                  gender: editingGender,
                  tags: editingTags,
                  category: editingCategory,
                  displayName: editingDisplayName,
                }
              : confession
          )
        );

        setEditingConfessionId(null);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (error) {
        console.error('Error saving edited confession:', error);
      }
    }
  };

  const validateFields = () => {
    if (!editingTitle || editingTitle.length > 100) {
      setError('Title is required and should not exceed 100 characters.');
      return false;
    }
    if (!editingContent || editingContent.length > 1000) {
      setError('Content is required and should not exceed 1000 characters.');
      return false;
    }
    if (editingAge && (isNaN(editingAge) || editingAge < 0 || editingAge > 150)) {
      setError('Please enter a valid age between 0 and 150.');
      return false;
    }
    const tagPattern = /^[a-zA-Z0-9]+$/;
    if (editingTags.some((tag) => !tagPattern.test(tag))) {
      setError('Tags should not contain special characters or spaces.');
      return false;
    }
    return true;
  };

  const handleTagChange = (newValue) => {
    const tagPattern = /^[a-zA-Z0-9]+$/;
    setEditingTags(newValue.map(tag => tag.value).filter((value) => tagPattern.test(value)));
  };

  const handleCategoryChange = (newValue) => {
    setEditingCategory(newValue.map(category => category.value));
  };

  const handleGenderChange = (selectedOption) => {
    setEditingGender(selectedOption.value);
  };

  const handleLoadMore = () => {
    setCurrentPage(currentPage + 1);
  };

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
    <div>
      {loading ? (
        <ClipLoader color="#ffffff" />
      ) : (
        <>
          {showSuccessMessage && <p className="text-green-500">Confession updated successfully!</p>}
          {confessions.slice(0, (currentPage + 1) * confessionsPerPage).map((confession) => (
            <div key={confession.id} className="confession-item bg-gray-800 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <Avatar name={confession.displayName} size="40" round={true} />
                <div className="ml-2">
                  <h4 className="text-white">{confession.title}</h4>
                  <TimeAgo timestamp={confession.createdAt ? confession.createdAt.toDate() : new Date()} />
                </div>
                <EditDropDown
                  onEdit={() => handleEditClick(confession)}
                  onDelete={() => handleDelete(confession.id)}
                />
              </div>
              <div>{confession.gender} {confession.age} {confession.location}</div>
              <div className="text-gray-400">{showMore[confession.id] ? confession.content : `${confession.content.substring(0, 200)}...`}</div>
              {confession.content.length > 200 && (
                <button onClick={() => setShowMore({ ...showMore, [confession.id]: !showMore[confession.id] })} className="text-blue-500">
                  {showMore[confession.id] ? 'Show Less' : 'Show More'}
                </button>
              )}
              <div className="flex justify-between mt-2">
                <div>
                  <FaThumbsUp className="text-blue-500 mr-2" />
                  <span>{confession.likes || 0}</span>
                </div>
                <div>
                  <FaComment className="text-blue-500 mr-2" />
                  <span>{confession.comments || 0}</span>
                </div>
              </div>
            </div>
          ))}
          {(currentPage + 1) * confessionsPerPage < confessions.length && (
            <button onClick={handleLoadMore} className="load-more bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Load More
            </button>
          )}
        </>
      )}

      {editingConfessionId && (
        <div className="edit-form bg-gray-900 p-4 rounded-lg">
          <input
            className="w-full p-2 mb-4 bg-gray-800 text-white"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            placeholder="Title"
            maxLength={100}
          />
          <ReactQuill
            value={editingContent}
            onChange={setEditingContent}
            modules={modules}
            theme="snow"
            placeholder="Content"
          />
          <input
            className="w-full p-2 mt-4 mb-4 bg-gray-800 text-white"
            type="number"
            value={editingAge}
            onChange={(e) => setEditingAge(e.target.value)}
            placeholder="Age (Optional)"
            min={0}
            max={150}
          />
          <input
            className="w-full p-2 mb-4 bg-gray-800 text-white"
            value={editingLocation}
            onChange={(e) => setEditingLocation(e.target.value)}
            placeholder="Location (Optional)"
          />
          <Select
            className="mb-4"
            value={{ value: editingGender, label: editingGender }}
            onChange={handleGenderChange}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
            placeholder="Select Gender (Optional)"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#333',
                color: 'white',
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#333',
                color: 'white',
              }),
            }}
          />
          <CreatableSelect
            className="mb-4"
            isMulti
            value={editingTags.map(tag => ({ value: tag, label: tag }))}
            onChange={handleTagChange}
            options={tags}
            placeholder="Tags (Optional)"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#333',
                color: 'white',
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#333',
                color: 'white',
              }),
            }}
          />
          <CreatableSelect
            className="mb-4"
            isMulti
            value={editingCategory.map(cat => ({ value: cat, label: cat }))}
            onChange={handleCategoryChange}
            options={categories}
            placeholder="Categories (Optional)"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#333',
                color: 'white',
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#333',
                color: 'white',
              }),
            }}
          />
          <Select
            className="mb-4"
            value={{ value: editingDisplayName, label: editingDisplayName }}
            onChange={(selectedOption) => setEditingDisplayName(selectedOption.value)}
            options={[
              { value: user.displayName, label: user.displayName },
              { value: 'Anonymous', label: 'Anonymous' },
            ]}
            placeholder="Select Display Name"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#333',
                color: 'white',
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#333',
                color: 'white',
              }),
            }}
          />
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end">
            <button onClick={() => setEditingConfessionId(null)} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded mr-2">
              Cancel
            </button>
            <button onClick={handleSaveEdit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
