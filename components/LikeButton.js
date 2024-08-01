import React, { useState, useEffect } from 'react';
import { FaThumbsUp } from 'react-icons/fa';
import { doc, updateDoc, increment, deleteField, getDoc } from 'firebase/firestore';
import { db } from '/firebase';
import { getAuth } from 'firebase/auth';

const LikeButton = ({ itemId, itemType }) => {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchLikes = async () => {
      const itemRef = doc(db, itemType, itemId);
      const itemSnap = await getDoc(itemRef);
      if (itemSnap.exists()) {
        const itemData = itemSnap.data();
        setLikes(itemData.likes || 0);
        if (user) {
          const userLikesRef = doc(db, 'users', user.uid);
          const userLikesSnap = await getDoc(userLikesRef);
          if (userLikesSnap.exists()) {
            const userLikes = userLikesSnap.data().likes || {};
            setLiked(userLikes[itemId] === true);
          }
        }
      }
    };

    fetchLikes();
  }, [itemId, itemType, user]);

  const handleLike = async () => {
    if (!user) return;
    const itemRef = doc(db, itemType, itemId);
    const userLikesRef = doc(db, 'users', user.uid);

    if (!liked) {
      await updateDoc(itemRef, { likes: increment(1) });
      await updateDoc(userLikesRef, { [`likes.${itemId}`]: true });
      setLikes((prev) => prev + 1);
      setLiked(true);
    } else {
      await updateDoc(itemRef, { likes: increment(-1) });
      await updateDoc(userLikesRef, { [`likes.${itemId}`]: deleteField() });
      setLikes((prev) => prev - 1);
      setLiked(false);
    }
  };

  return (
    <button
      className={`flex items-center space-x-1 ${liked ? 'text-blue-500' : 'text-gray-400'} hover:text-white`}
      onClick={handleLike}
    >
      <FaThumbsUp />
      <span>{likes}</span>
    </button>
  );
};

export default LikeButton;
