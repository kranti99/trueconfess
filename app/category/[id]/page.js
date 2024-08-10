'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '/firebase'; 
import dynamic from "next/dynamic";
import Link from 'next/link';
import { FaThumbsUp, FaComment } from "react-icons/fa";
import parse from "html-react-parser";
import LoadingSpinner from '/components/LoadingSpinner'; 

const Avatar = dynamic(() => import("react-avatar"), { ssr: false });
const TimeAgo = dynamic(() => import("/components/TimeAgo"), { ssr: false });

const SingleCategoryPage = () => {
  const params = useParams();
  const categoryId = params.id;

  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      const fetchConfessions = async () => {
        try {
          const confessionsRef = collection(db, 'confessions');
          const q = query(confessionsRef, where('category', 'array-contains', categoryId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const confessionsList = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setConfessions(confessionsList);
          } else {
            setConfessions([]);
          }
        } catch (error) {
          console.error('Error fetching confessions: ', error);
        } finally {
          setLoading(false);
        }
      };

      fetchConfessions();
    }
  }, [categoryId]);

  const truncateContent = (content, maxLength) => {
    if (content.length > maxLength) {
      return content.substring(0, maxLength) + "...";
    }
    return content;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 p-4 text-white mt-12">
      <h1 className="text-3xl font-bold mb-6">Category: {categoryId}</h1>
      
      {confessions.length === 0 ? (
        <p className="text-gray-500">No confessions found in this category.</p>
      ) : (
        <div className="space-y-6">
          {confessions.map((confession) => (
            <div key={confession.id} className="relative">
              <Link href={`/confession/${confession.id}`}>
                <div className="p-6 border bg-dark-background-light border-gray-700 rounded-lg shadow-md hover:bg-zinc-900 transition duration-300 cursor-pointer">
                  <div className="flex items-center mb-2">
                    <Avatar src={confession.avatar || '/default-avatar.png'} size="40" round />
                    <div className="ml-4">
                      <h2 className="text-sm font-semibold mb-0">{confession.nickname}</h2>
                      <TimeAgo timestamp={confession.date} />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-blue-500 hover:underline mb-4">
                    {confession.title}
                  </h2>
                  <div className="text-gray-300 mb-4">
                    {parse(truncateContent(confession.content, 200))}
                  </div>
                  <div className="flex items-center space-x-4 text-gray-400 mb-4">
                    <div className="flex items-center">
                      <FaThumbsUp className="mr-1" /> {confession.likes}
                    </div>
                    <div className="flex items-center">
                      <FaComment className="mr-1" /> {confession.commentCount}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {confession.category && confession.category.length > 0 && (
                      <div className="flex items-center">
                        <span className="text-gray-400 text-xs font-semibold">Category:</span>
                        {confession.category.map((cat, index) => (
                          <Link key={index} href={`/category/${cat.value || cat}`}>
                            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md hover:bg-gray-600 transition duration-300 ml-2">
                              {cat.label || cat}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {confession.tags && confession.tags.length > 0 && (
                      <div className="flex items-center">
                        <span className="text-gray-400 text-xs font-semibold">Tags:</span>
                        {confession.tags.map((tag, index) => (
                          <Link key={index} href={`/tags/${tag.value || tag}`}>
                            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md hover:bg-gray-600 transition duration-300 ml-2">
                              {tag.label || tag}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SingleCategoryPage;
