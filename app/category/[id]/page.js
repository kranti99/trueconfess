'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '/firebase'; // Adjust the path according to your firebase config
import LoadingSpinner from '/components/LoadingSpinner'; // Ensure you have a loading spinner component
import Link from 'next/link'; // Add Link import if not already imported

const SingleCategoryPage = () => {
  const params = useParams();
  const categoryId = params.categoryId;
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('categoryId:', categoryId); // Debugging log to check if categoryId is being set
    if (categoryId) {
      const fetchConfessions = async () => {
        try {
          const confessionsRef = collection(db, 'confessions');
          const q = query(confessionsRef, where('categories', 'array-contains', categoryId));
          const querySnapshot = await getDocs(q);
          const confessionsList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setConfessions(confessionsList);
          console.log('Fetched confessions:', confessionsList); // Debugging log for fetched data
        } catch (error) {
          console.error('Error fetching confessions: ', error);
        } finally {
          setLoading(false);
        }
      };

      fetchConfessions();
    }
  }, [categoryId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 text-white mt-12">
      <h1 className="text-3xl font-bold mb-6">Category: {categoryId}</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {confessions.map((confession) => (
          <li key={confession.id} className="p-4 border bg-dark-background-light border-gray-700 rounded-lg shadow-md hover:bg-zinc-900 transition duration-300">
            <h2 className="text-xl font-bold">{confession.title}</h2>
            <p className="text-gray-400">{confession.content}</p>
            <p className="text-gray-500">Comments: {confession.commentCount}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {confession.categories && confession.categories.length > 0 && (
                <div className="flex items-center">
                  <span className="text-gray-400 text-xs font-semibold">Category:</span>
                  {confession.categories.map((cat, index) => (
                    <Link key={index} href={`/category/${cat}`}>
                      <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md hover:bg-gray-600 transition duration-300 ml-2">
                        {cat}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SingleCategoryPage;
