'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '/firebase';
import dynamic from 'next/dynamic';
import { FaEdit, FaTrash } from 'react-icons/fa';
import HTMLReactParser from 'html-react-parser';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import 'quill-emoji/dist/quill-emoji.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const MyConfessionList = ({ user }) => {
  const [confessions, setConfessions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchConfessions = async () => {
      try {
        const q = query(collection(db, 'confessions'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedConfessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setConfessions(fetchedConfessions);
      } catch (error) {
        console.error('Error fetching user confessions:', error);
      }
    };

    fetchConfessions();
  }, [user.uid]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'confessions', id));
      setConfessions(confessions.filter(confession => confession.id !== id));
    } catch (error) {
      console.error('Error deleting confession:', error);
    }
  };

  const handleEdit = async (id, title, content) => {
    try {
      await updateDoc(doc(db, 'confessions', id), { title, content });
      setConfessions(confessions.map(confession => (
        confession.id === id
          ? { ...confession, title, content }
          : confession
      )));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating confession:', error);
    }
  };

  const handleSaveDraft = (id, title, content) => {
    // Implementation for saving draft if needed
  };

  return (
    <div>
      {confessions.map((confession) => (
        <div key={confession.id}>
          <h2 style={{ color: 'black', borderBottom: '1px solid black' }}>
            {isClient && HTMLReactParser(confession.title)}
          </h2>
          <p>
            {isClient && HTMLReactParser(confession.content.slice(0, 100))}
            {confession.content.length > 100 && (
              <button onClick={() => handleEdit(confession.id, confession.title, confession.content)}>Read more</button>
            )}
          </p>
          <div>
            <button onClick={() => setEditingId(confession.id)}>
              <FaEdit /> Edit
            </button>
            <button onClick={() => handleDelete(confession.id)}>
              <FaTrash /> Delete
            </button>
          </div>
          {editingId === confession.id && (
            <div>
              <ReactQuill value={editingContent} onChange={setEditingContent} />
              <button onClick={() => handleEdit(confession.id, editingTitle, editingContent)}>Save</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyConfessionList;
