import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '/firebase';
import parse from 'html-react-parser';
import dynamic from 'next/dynamic';
import { ClipLoader } from 'react-spinners';
import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import Select from 'react-select';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import EditDropDown from './EditDropDown';
import 'quill-emoji/dist/quill-emoji.css';
import { Quill } from 'react-quill';
import { EmojiBlot, ShortNameEmoji, ToolbarEmoji } from 'quill-emoji';
import TimeAgo from './TimeAgo'; // Updated import

const modules = {
  toolbar: [
    [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
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

// Utility function to strip HTML tags
const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

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
  { value: 'memes', label: 'Memes' },
  { value: 'gaming', label: 'Gaming' },
];

export default function MyConfessionList({ user }) {
  const [confessions, setConfessions] = useState([]);
  const [editingConfessionId, setEditingConfessionId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingTags, setEditingTags] = useState([]);
  const [editingCategory, setEditingCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showMore, setShowMore] = useState({});
  const [sortType, setSortType] = useState('mostRecent');
  const [displayName, setDisplayName] = useState('username');
  const [editingDisplayName, setEditingDisplayName] = useState('username');

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
        }
      }
    };

    fetchUserConfessions();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      const commentsQuery = query(collection(db, 'confessions', id, 'comments'));
      const commentsSnapshot = await getDocs(commentsQuery);
      const deleteCommentPromises = commentsSnapshot.docs.map((commentDoc) => deleteDoc(commentDoc.ref));
      await Promise.all(deleteCommentPromises);

      await deleteDoc(doc(db, 'confessions', id));
      setConfessions(confessions.filter((confession) => confession.id !== id));
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error deleting confession:', error);
    }
  };

  const handleEdit = (id, title, content, displayName, tags, category) => {
    setEditingConfessionId(id);
    setEditingTitle(title);
    setEditingContent(content);
    setEditingDisplayName(displayName || 'username'); // Ensure displayName has a default value
    setEditingTags((tags || []).map(tag => ({ value: tag, label: tag }))); // Ensure tags is an array
    setEditingCategory((category || []).map(cat => ({ value: cat, label: cat }))); // Ensure category is an array
  };

  const handleUpdate = async (id) => {
    try {
      const confessionDoc = doc(db, 'confessions', id);
      await updateDoc(confessionDoc, {
        title: editingTitle,
        content: editingContent,
        displayName: editingDisplayName || 'username', // Ensure displayName has a default value
        tags: (editingTags || []).map(tag => tag.value), // Ensure tags is an array
        category: (editingCategory || []).map(cat => cat.value) // Ensure category is an array
      });
      setConfessions(confessions.map((confession) =>
        (confession.id === id ? { ...confession, title: editingTitle, content: editingContent, displayName: editingDisplayName, tags: (editingTags || []).map(tag => tag.value), category: (editingCategory || []).map(cat => cat.value) } : confession)
      ));
      setEditingConfessionId(null);
      setEditingTitle('');
      setEditingContent('');
      setEditingDisplayName('username');
      setEditingTags([]);
      setEditingCategory([]);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error updating confession:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingConfessionId(null);
    setEditingTitle('');
    setEditingContent('');
    setEditingDisplayName('username');
    setEditingTags([]);
    setEditingCategory([]);
  };

  const handleReadMoreToggle = (id) => {
    setShowMore((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sortConfessions = (confessions, type) => {
    if (type === 'mostRecent') {
      return confessions.sort((a, b) => b.date - a.date);
    } else if (type === 'mostCommented') {
      return confessions.sort((a, b) => b.commentCount - a.commentCount);
    }
    return confessions;
  };

  const sortedConfessions = sortConfessions([...confessions], sortType);

  const handleSortChange = (event) => {
    setSortType(event.target.value);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-2xl font-semibold">My Confessions</h2>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Sort by:</span>
          <select
            className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
            value={sortType}
            onChange={handleSortChange}
          >
            <option value="mostRecent">Most Recent</option>
            <option value="mostCommented">Most Commented</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center mt-8">
          <ClipLoader color={"#ffffff"} loading={loading} size={50} />
        </div>
      ) : (
        <div className="mt-8">
          {confessions.length === 0 ? (
            <p>No confessions yet.</p>
          ) : (
            <ul className="space-y-4 list-none">
              {sortedConfessions.map((confession) => (
                <li key={confession.id} className="p-4 border border-gray-700 rounded shadow-sm relative">
                  <div className="absolute right-4 top-4">
                    <EditDropDown 
                      onEdit={() => handleEdit(confession.id, confession.title, confession.content, confession.displayName, confession.tags, confession.category)}
                      onDelete={() => handleDelete(confession.id)}
                    />
                  </div>
                  {editingConfessionId === confession.id ? (
                    <div>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-800 text-white"
                      />
                      <ReactQuill
                        value={editingContent}
                        onChange={setEditingContent}
                        modules={modules}
                        className="mb-2"
                      />
                      <Select
                        isMulti
                        options={predefinedCategories}
                        value={editingCategory}
                        onChange={setEditingCategory}
                        className="mb-2 w-1/2 bg-gray-800 text-white"
                        placeholder="Select category..."
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            backgroundColor: '#1f2937', // Tailwind gray-800
                            color: 'white',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            backgroundColor: '#1f2937',
                          }),
                          multiValue: (provided) => ({
                            ...provided,
                            backgroundColor: '#374151', // Tailwind gray-700
                            color: 'white',
                          }),
                          input: (provided) => ({
                            ...provided,
                            color: 'white',
                          }),
                        }}
                      />
                      <Select
                        isMulti
                        options={predefinedCategories.map(cat => ({ value: cat.value, label: cat.label }))}
                        value={editingTags}
                        onChange={setEditingTags}
                        className="mb-2 w-1/2 bg-gray-800 text-white"
                        placeholder="Select tags..."
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            backgroundColor: '#1f2937',
                            color: 'white',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            backgroundColor: '#1f2937',
                          }),
                          multiValue: (provided) => ({
                            ...provided,
                            backgroundColor: '#374151',
                            color: 'white',
                          }),
                          input: (provided) => ({
                            ...provided,
                            color: 'white',
                          }),
                        }}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(confession.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                          Update
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold">{confession.title}</h3>
                      <p className="text-gray-400 text-sm">By {confession.displayName} on <TimeAgo timestamp={confession.date} /></p>
                      <div className="mt-2">
                        {showMore[confession.id] ? (
                          <div>{parse(confession.content)}</div>
                        ) : (
                          <div>{parse(stripHtml(confession.content).slice(0, 150))}...</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleReadMoreToggle(confession.id)}
                        className="text-blue-400 hover:underline mt-2"
                      >
                        {showMore[confession.id] ? 'Read less' : 'Read more'}
                      </button>
                      <div className="flex items-center space-x-2 mt-4">
                        <span className="text-gray-400 text-xs">Category: {confession.category?.length > 0 ? confession.category.join(', ') : 'General'}</span>
                        <span className="text-gray-400 text-xs">Tags: {confession.tags?.length > 0 ? confession.tags.join(', ') : 'None'}</span>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {showSuccessMessage && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded">
              <FaCheckCircle className="inline mr-2" /> Action Successful
            </div>
          )}
        </div>
      )}
    </div>
  );
}
