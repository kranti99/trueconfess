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
  const [error, setError] = useState(null);
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
      setError('Error deleting confession.');
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
      setError('Error updating confession.');
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
          {sortedConfessions.length === 0 ? (
            <p className="text-gray-400">No confessions found.</p>
          ) : (
            sortedConfessions.map((confession) => (
              <div
                key={confession.id}
                className="bg-gray-800 p-4 rounded-md mb-4 shadow-lg"
              >
                {editingConfessionId === confession.id ? (
                  <div className="edit-mode">
                    <input
                      className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      placeholder="Title"
                    />
                    <ReactQuill
                      value={editingContent}
                      onChange={setEditingContent}
                      modules={modules}
                      className="bg-gray-700 text-white rounded mb-2"
                    />
                    <Select
                      value={editingTags}
                      onChange={setEditingTags}
                      options={tags}
                      isMulti
                      placeholder="Tags"
                      className="bg-gray-700 text-white rounded mb-2"
                    />
                    <Select
                      value={editingCategory}
                      onChange={setEditingCategory}
                      options={categories}
                      isMulti
                      placeholder="Category"
                      className="bg-gray-700 text-white rounded mb-2"
                    />
                    <input
                      className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                      value={editingDisplayName}
                      onChange={(e) => setEditingDisplayName(e.target.value)}
                      placeholder="Display Name"
                    />
                    <button
                      onClick={() => handleUpdate(confession.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-600 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="view-mode">
                    <h3 className="text-xl font-semibold mb-2 cursor-pointer" onClick={() => navigateToConfession(confession.id)}>{confession.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">
                      <TimeAgo timestamp={confession.date} />
                      {' | '}
                      <span>{confession.commentCount} comments</span>
                    </p>
                    <div className="text-gray-200 mb-2">
                      {showMore[confession.id]
                        ? parse(confession.content)
                        : parse(confession.content.slice(0, 200))}
                    </div>
                    {stripHtml(confession.content).length > 200 && (
                      <button
                        onClick={() => handleReadMoreToggle(confession.id)}
                        className="text-blue-500 hover:underline"
                      >
                        {showMore[confession.id] ? 'Read less' : 'Read more'}
                      </button>
                    )}
                    <p className="text-sm text-gray-400 mt-2">Posted by: {confession.displayName}</p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() =>
                          handleEdit(
                            confession.id,
                            confession.title,
                            confession.content,
                            confession.displayName,
                            confession.tags,
                            confession.category
                          )
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(confession.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded">
          <FaCheckCircle className="inline-block mr-2" /> Confession updated successfully!
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
