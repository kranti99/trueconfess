'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, increment, setDoc, deleteField } from 'firebase/firestore';
import { db } from '/firebase';
import CommentList from '@components/CommentList';
import CommentForm from '@components/CommentForm';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Avatar from 'react-avatar';
import { FaThumbsUp, FaComment } from 'react-icons/fa';
import TimeAgo from '@components/TimeAgo';
import parse from 'html-react-parser';
import { getAuth } from 'firebase/auth';

export default function ConfessionDetail() {
  const pathname = usePathname();
  const router = useRouter();
  const [confession, setConfession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLikes, setUserLikes] = useState({});
  const auth = getAuth();
  const user = auth.currentUser;

  const id = pathname.split('/').pop(); // Extract the id from the pathname

  useEffect(() => {
    if (!id) {
      setError('No confession ID found');
      setLoading(false);
      return;
    }

    const fetchConfession = async () => {
      try {
        const docRef = doc(db, 'confessions', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setConfession({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Confession not found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfession();
  }, [id]);

  useEffect(() => {
    if (user) {
      const fetchUserLikes = async () => {
        const userLikesRef = doc(db, 'users', user.uid);
        const userLikesSnap = await getDoc(userLikesRef);
        if (userLikesSnap.exists()) {
          setUserLikes(userLikesSnap.data().likes || {});
        }
      };

      fetchUserLikes();
    }
  }, [user]);

  const handleLike = async () => {
    if (!userLikes[id]) {
      try {
        const confessionRef = doc(db, 'confessions', id);
        await updateDoc(confessionRef, {
          likes: increment(1),
        });
        const userLikesRef = doc(db, 'users', user.uid);
        await updateDoc(userLikesRef, {
          [`likes.${id}`]: true,
        });
        setUserLikes((prevLikes) => ({ ...prevLikes, [id]: true }));
      } catch (error) {
        console.error('Error liking confession:', error);
      }
    } else {
      try {
        const confessionRef = doc(db, 'confessions', id);
        await updateDoc(confessionRef, {
          likes: increment(-1),
        });
        const userLikesRef = doc(db, 'users', user.uid);
        await updateDoc(userLikesRef, {
          [`likes.${id}`]: deleteField(),
        });
        setUserLikes((prevLikes) => {
          const updatedLikes = { ...prevLikes };
          delete updatedLikes[id];
          return updatedLikes;
        });
      } catch (error) {
        console.error('Error unliking confession:', error);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="space-y-4 p-4 bg-gray-900 text-white">
      {confession && (
        <div className="p-6 bg-gray-800 rounded shadow-lg">
          <div className="flex items-start space-x-4 mb-4">
            <Avatar 
              name={confession.anonymous ? 'Anonymous User' : confession.nickname} 
              src={confession.avatar || '/default-avatar.png'} 
              size="50" 
              round={true} 
            />
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <p className="font-bold text-base">
                  {confession.anonymous ? 'Anonymous User' : confession.nickname}
                </p>
                <TimeAgo timestamp={confession.date} />
              </div>
              <h2 className="text-xl font-semibold text-white mt-2">{confession.title}</h2>
            </div>
          </div>
          <div className="text-gray-300 mb-4">
            {parse(confession.content)}
          </div>
          <div className="text-sm text-gray-400 flex space-x-4">
            <button
              className={`flex items-center space-x-1 ${userLikes[id] ? 'text-blue-500' : 'text-gray-400'} hover:text-white`}
              onClick={handleLike}
            >
              <FaThumbsUp />
              <span>{confession.likes}</span>
            </button>
            <span className="flex items-center space-x-1">
              <FaComment />
              <span>{confession.commentCount}</span>
            </span>
          </div>
          <CommentForm confessionId={id} />
          <CommentList confessionId={id} />
        </div>
      )}
    </div>
  );
}
