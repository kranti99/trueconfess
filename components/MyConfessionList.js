'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '/firebase';
import parse from 'html-react-parser';
import dynamic from 'next/dynamic';
import { ClipLoader } from 'react-spinners';
import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link'; // Import Link for navigation

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import EditDropDown from './EditDropDown'; // Import EditDropDown

import 'react-quill/dist/quill.bubble.css';
import 'quill-emoji/dist/quill-emoji.css';
import { Quill } from 'react-quill';
import { EmojiBlot, ShortNameEmoji, ToolbarEmoji } from 'quill-emoji';

const modules = {
  toolbar: [
    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
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

export default function MyConfessionList({ user }) {
  const [confessions, setConfessions] = useState([]);
  const [editingConfessionId, setEditingConfessionId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showMore, setShowMore] = useState({}); // State to control "Read more" / "Read less" functionality

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
      await deleteDoc(doc(db, 'confessions', id));
      setConfessions(confessions.filter((confession) => confession.id !== id));
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error deleting confession:', error);
    }
  };

  const handleEdit = (id, title, content) => {
    setEditingConfessionId(id);
    setEditingTitle(title);
    setEditingContent(content);
  };

  const handleUpdate = async (id) => {
    try {
      const confessionDoc = doc(db, 'confessions', id);
      await updateDoc(confessionDoc, { title: editingTitle, content: editingContent });
      setConfessions(confessions.map((confession) =>
        (confession.id === id ? { ...confession, title: editingTitle, content: editingContent } : confession)
      ));
      setEditingConfessionId(null);
      setEditingTitle('');
      setEditingContent('');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error updating confession:', error);
    }
  };

  const handleReadMoreToggle = (id) => {
    setShowMore((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mt-8">My Confessions</h2>
      {confessions.length === 0 ? (
        <p>No confessions yet.</p>
      ) : (
        <ul className="space-y-4 list-none">
          {confessions.map((confession) => (
            <li key={confession.id} className="p-4 border border-gray-300 rounded shadow-sm relative">
              <div className="absolute right-4 top-4">
                <EditDropDown 
                  onEdit={() => handleEdit(confession.id, confession.title, confession.content)}
                  onDelete={() => handleDelete(confession.id)}
                  itemId={confession.id}
                />
              </div>
              {editingConfessionId === confession.id ? (
                <div>
                  <input 
                    type="text" 
                    value={editingTitle} 
                    onChange={(e) => setEditingTitle(e.target.value)} 
                    placeholder="Title"
                    className="w-full p-2 border-b border-white mb-2 bg-black" // Black title field with border-bottom
                  />
                  <ReactQuill value={editingContent} onChange={setEditingContent} modules={modules} />
                  <button 
                    onClick={() => handleUpdate(confession.id)} 
                    className="text-blue-500 hover:underline mt-2 block"
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => setEditingConfessionId(null)} 
                    className="text-red-500 hover:underline mt-2 block"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <Link href={`/confession/${confession.id}`}>
                      <h3 className="text-xl font-semibold border-b border-black pb-1 cursor-pointer">
                        {confession.title}
                      </h3>
                  </Link>
                  <p>
                    {showMore[confession.id] || confession.content.length < 200
                      ? parse(confession.content)
                      : parse(confession.content.substring(0, 200) + '...')}
                  </p>
                  {confession.content.length > 200 && (
                    <button 
                      onClick={() => handleReadMoreToggle(confession.id)}
                      className="text-blue-500 hover:underline mt-2 block"
                    >
                      {showMore[confession.id] ? 'Read less' : 'Read more'}
                    </button>
                  )}
                  <div className="text-sm text-gray-500 mt-2">
                    <span>Likes: {confession.likes}</span> | <span> <Link href={`/confession/${confession.id}`}>Comments: {confession.commentCount}</Link></span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded flex items-center">
          <FaCheckCircle className="mr-2" />
          <span>Action completed successfully!</span>
        </div>
      )}
    </div>
  );
}
