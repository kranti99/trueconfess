import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '/firebase';
import { FaThumbsUp, FaComment } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import dynamic from 'next/dynamic';
import ConfessionItem from './ConfessionItem';

const TimeAgo = dynamic(() => import('@components/TimeAgo'), { ssr: false });
import { displayName } from 'react-quill';

export default function MyConfessionList({ user }) {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const confessionsPerPage = 5;

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
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserConfessions();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'confessions', id));
      setConfessions(confessions.filter((confession) => confession.id !== id));
    } catch (error) {
      console.error('Error deleting confession:', error);
    }
  };

  const handleLoadMore = () => {
    setCurrentPage(currentPage + 1);
  };

  return (
    <div>
      {loading ? (
        <ClipLoader color="#ffffff" />
      ) : (
        <>
          {confessions.slice(0, (currentPage + 1) * confessionsPerPage).map((confession) => (
            <ConfessionItem
              key={confession.id}
              confession={confession}
              onDelete={handleDelete}
              username= {user.displayName}
            />
          ))}
          {confessions.length > (currentPage + 1) * confessionsPerPage && (
            <button
              onClick={handleLoadMore}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-6 hover:bg-blue-600"
            >
              Load More
            </button>
          )}
        </>
      )}
    </div>
  );
}
