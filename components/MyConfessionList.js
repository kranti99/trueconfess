import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '/firebase';
import parse from 'html-react-parser';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ClipLoader } from 'react-spinners';
import { FaCheckCircle } from 'react-icons/fa';
import Select from 'react-select';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import EditDropDown from './EditDropDown';
import 'quill-emoji/dist/quill-emoji.css';
import { Quill } from 'react-quill';
import { EmojiBlot, ShortNameEmoji, ToolbarEmoji } from 'quill-emoji';
import TimeAgo from './TimeAgo';

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
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const router = useRouter();

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
    setEditingDisplayName(displayName || 'username');
    setEditingTags((tags || []).map(tag => ({ value: tag, label: tag })));
    setEditingCategory((category || []).map(cat => ({ value: cat, label: cat })));
  };

  const handleUpdate = async (id) => {
    try {
      const confessionDoc = doc(db, 'confessions', id);
      await updateDoc(confessionDoc, {
        title: editingTitle,
        content: editingContent,
        displayName: editingDisplayName || 'username',
        tags: (editingTags || []).map(tag => tag.value),
        category: (editingCategory || []).map(cat => cat.value)
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

  const navigateToConfession = (id) => {
    router.push(`/confession/${id}`);
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
                <li
                  key={confession.id}
                  className="p-4 border border-gray-700 rounded shadow-sm relative cursor-pointer"
                >
                  <div className="absolute right-4 top-4">
                    <EditDropDown
                      onEdit={() => handleEdit(
                        confession.id,
                        confession.title,
                        confession.content,
                        confession.displayName,
                        confession.tags,
                        confession.category
                      )}
                      onDelete={() => handleDelete(confession.id)}
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{confession.title}</h3>
                  <p className="text-gray-400">
                    {showMore[confession.id]
                      ? parse(confession.content)
                      : stripHtml(confession.content).slice(0, 100) + '...'}
                    <button
                      className="text-blue-500 hover:underline ml-2"
                      onClick={() => handleReadMoreToggle(confession.id)}
                    >
                      {showMore[confession.id] ? 'Read Less' : 'Read More'}
                    </button>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    By: {confession.displayName || 'username'}
                  </p>
                  <TimeAgo timestamp={confession.date} />
                  <div className="mt-4 flex flex-wrap space-x-2">
                    {confession.tags && confession.tags.map((tag, index) => (
                      <a
                        key={index}
                        href={`/tag/${tag}`}
                        className="px-2 py-1 bg-blue-600 rounded text-xs text-white hover:bg-blue-500"
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap space-x-2">
                    {confession.category && confession.category.map((cat, index) => (
                      <a
                        key={index}
                        href={`/category/${cat}`}
                        className="px-2 py-1 bg-purple-600 rounded text-xs text-white hover:bg-purple-500"
                      >
                        {cat}
                      </a>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {editingConfessionId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-2xl mb-4">Edit Confession</h3>
            <input
              type="text"
              className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              placeholder="Title"
            />
            <input
              type="text"
              className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white"
              value={editingDisplayName}
              onChange={(e) => setEditingDisplayName(e.target.value)}
              placeholder="Display Name"
            />
            <Select
              isMulti
              options={tags}
              value={editingTags}
              onChange={setEditingTags}
              placeholder="Tags"
              className="mb-4"
            />
            <Select
              isMulti
              options={categories}
              value={editingCategory}
              onChange={setEditingCategory}
              placeholder="Category"
              className="mb-4"
            />
            <ReactQuill
              value={editingContent}
              onChange={setEditingContent}
              modules={modules}
              className="mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white"
                onClick={() => handleUpdate(editingConfessionId)}
              >
                Save
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-600 text-white"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg flex items-center">
          <FaCheckCircle className="mr-2" />
          <span>Confession updated successfully!</span>
        </div>
      )}
    </div>
  );
}
