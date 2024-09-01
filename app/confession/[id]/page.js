'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, increment, deleteField } from 'firebase/firestore';
import { db } from '/firebase';
import CommentList from '@components/CommentList';
import CommentForm from '@components/CommentForm';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Avatar from 'react-avatar';
import { FaThumbsUp, FaComment, FaMapMarkerAlt, FaVenusMars, FaCalendarAlt, FaTag, FaFolder } from 'react-icons/fa';
import TimeAgo from '@components/TimeAgo';
import parse from 'html-react-parser';
import { getAuth } from 'firebase/auth';

export default function ConfessionDetail({ params }) {
  const pathname = usePathname();
  const router = useRouter();
  const [confession, setConfession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLikes, setUserLikes] = useState({});
  const [userData, setUserData] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  const id = params.id;

  useEffect(() => {
    if (!id) {
      setError('No confession ID found');
      setLoading(false);
      return;
    }

    const fetchConfession = async () => {
      try {
        const confessionDocRef = doc(db, 'confessions', id);
        const confessionSnap = await getDoc(confessionDocRef);

        if (confessionSnap.exists()) {
          const confessionData = confessionSnap.data();

          const userDocRef = doc(db, 'users', confessionData.userId);
          const userSnap = await getDoc(userDocRef);

          const mergedData = {
            id: confessionSnap.id,
            ...confessionData,
            avatar: userSnap.exists() ? userSnap.data().avatar : '/default-avatar.png',
            nickname: userSnap.exists() ? userSnap.data().nickname : 'Anonymous',
          };

          setConfession(mergedData);
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
        setConfession((prevConfession) => ({
          ...prevConfession,
          likes: prevConfession.likes + 1,
        }));
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
        setConfession((prevConfession) => ({
          ...prevConfession,
          likes: prevConfession.likes - 1,
        }));
      } catch (error) {
        console.error('Error unliking confession:', error);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="space-y-6 mt-16 text-white">
      {confession && (
        <>
          <div className="p-8 bg-dark-background-light rounded-lg shadow-lg">
            <div className="flex items-start space-x-4 mb-4">
              {confession.avatar && (
                <Avatar
                  name={confession.nickname}
                  src={confession.avatar}
                  size="50"
                  round={true}
                />
              )}
              <div>
                <div className="text-sm text-gray-500">
                  <p className="font-bold text-base mb-0">
                    {confession.anonymous ? 'Anonymous User' : confession.nickname}
                  </p>
                  <div className="flex items-center pl-0">
                    <FaCalendarAlt className="text-yellow-500 pr-1" />
                    <TimeAgo timestamp={confession.date} className="ml-2" />
                  </div>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-400 flex flex-wrap gap-4 mb-2">
              {confession.location && (
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-red-500 mr-2" /> {confession.location}
                </div>
              )}
              {confession.gender && (
                <div className="flex items-center">
                  <FaVenusMars className="text-purple-500 mr-2" /> {confession.gender}
                </div>
              )}
              {confession.age && (
                <div className="flex items-center">
                  <FaCalendarAlt className="text-yellow-500 mr-2" /> {confession.age} years old
                </div>
              )}
            </div>
            <div className="text-sm text-gray-400 flex space-x-4 mb-6">
              {confession.categories?.length > 0 && (
                <div className="flex items-center">
                  <FaFolder className="mr-2 text-blue-500" />
                  <strong>Categories:</strong>
                  <div className="flex space-x-2 ml-2">
                    {confession.categories.map((cat) => (
                      <a
                        key={cat}
                        href={`/category/${cat}`}
                        className="text-blue-500 hover:underline"
                      >
                        {cat}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {confession.tags?.length > 0 && (
                <div className="flex items-center">
                  <FaTag className="mr-2 text-green-500" />
                  <strong>Tags:</strong>
                  <div className="flex space-x-2 ml-2">
                    {confession.tags.map((tag) => (
                      <a
                        key={tag}
                        href={`/tag/${tag}`}
                        className="text-blue-500 hover:underline"
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-blue-500 mt-2">{confession.title}</h2>

            <div className="text-gray-300 leading-relaxed mb-4">
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
          </div>
          <CommentForm confessionId={id} />
          <CommentList confessionId={id} />
        </>
      )}
    </div>
  );
}
