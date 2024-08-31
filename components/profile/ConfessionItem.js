import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '/firebase';
import ConfessionDetails from './ConfessionDetails';
import EditConfessionForm from './EditConfessionForm';
import ConfessionActions from './ConfessionActions';
import ConfessionContent from './ConfessionContent';

export default function ConfessionItem({ confession, onDelete, avatar, nickname }) {
  const [editingConfessionId, setEditingConfessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [editingAge, setEditingAge] = useState('');
  const [editingLocation, setEditingLocation] = useState('');
  const [editingGender, setEditingGender] = useState('');
  const [editingTags, setEditingTags] = useState([]);
  const [editingCategories, setEditingCategories] = useState([]);
  const [editingNickname, setEditingNickname] = useState('');
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fetch tags and categories from Firestore (assuming they are stored in a collection)
  useEffect(() => {
    const fetchTagsAndCategories = async () => {
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

    fetchTagsAndCategories();
  }, []);

  const handleEditClick = (confession) => {
    setEditingConfessionId(confession.id);
    setEditingTitle(confession.title);
    setEditingContent(confession.content);
    setEditingAge(confession.age);
    setEditingLocation(confession.location);
    setEditingGender(confession.gender);
    setEditingTags(confession.tags);
    setEditingCategories(confession.categories);
    setEditingNickname(nickname || 'Anonymous');
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingTitle || !editingContent) {
        setError('Title and content are required.');
        return;
      }

      const confessionDocRef = doc(db, 'confessions', editingConfessionId);
      await updateDoc(confessionDocRef, {
        title: editingTitle,
        content: editingContent,
        age: editingAge,
        location: editingLocation,
        gender: editingGender,
        tags: editingTags,
        categories: editingCategories,
        nickname: editingNickname,
      });

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      setEditingConfessionId(null);
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    }
  };

  return (
    <div className="confession-item bg-gray-800 p-4 rounded-lg mb-4">
      {editingConfessionId === confession.id ? (
        <EditConfessionForm
          editingConfessionId={editingConfessionId}
          editingTitle={editingTitle}
          editingContent={editingContent}
          editingAge={editingAge}
          editingLocation={editingLocation}
          editingGender={editingGender}
          editingTags={editingTags}
          editingCategories={editingCategories}
          editingNickname={editingNickname}
          tags={tags}
          categories={categories}
          error={error}
          showSuccessMessage={showSuccessMessage}
          setEditingTitle={setEditingTitle}
          setEditingContent={setEditingContent}
          setEditingAge={setEditingAge}
          setEditingLocation={setEditingLocation}
          setEditingGender={setEditingGender}
          setEditingTags={setEditingTags}
          setEditingCategories={setEditingCategories}
          setEditingNickname={setEditingNickname}
          handleSaveEdit={handleSaveEdit}
          setEditingConfessionId={setEditingConfessionId}
        />
      ) : (
        <>
          <ConfessionDetails confession={confession} avatar={avatar} nickname={nickname} />
          <ConfessionContent content={confession.content} />
          <ConfessionActions
            confession={confession}
            onDelete={onDelete}
            onEdit={handleEditClick}
          />
        </>
      )}
    </div>
  );
}
