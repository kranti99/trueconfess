'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '/firebase';
import CommentList from '@components/CommentList';
import CommentForm from '@components/CommentForm';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Avatar from 'react-avatar';
import { FaThumbsUp, FaComment } from 'react-icons/fa';
import TimeAgo from '@components/TimeAgo';
import parse from 'html-react-parser';

export default function ConfessionDetail() {
  const pathname = usePathname();
  const router = useRouter();
  const [confession, setConfession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
            <span className="flex items-center space-x-1">
              <FaThumbsUp />
              <span>{confession.likes}</span>
            </span>
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
