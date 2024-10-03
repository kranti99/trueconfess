import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react'

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
      className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-400'} hover:text-red-700`}
      onClick={handleLike}
    >
      <Heart 
        className={`w-4 h-4 transition-all duration-300 ${liked
            ? 'text-red-500 fill-red-500' 
            : 'text-gray-400 fill-transparent group-hover:text-red-500'
        }`} 
      />
      <span>{likes}</span>
    </button>
  );
};

export default LikeButton;
