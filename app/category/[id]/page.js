'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "/firebase";
import dynamic from "next/dynamic";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import parse from "html-react-parser";

const Avatar = dynamic(() => import("react-avatar"), { ssr: false });
const TimeAgo = dynamic(() => import("@components/TimeAgo"), { ssr: false });

const SingleCategory = ({ params }) => {
  const { categoryId } = params;
  const [confessions, setConfessions] = useState([]);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const fetchConfessionsAndCategory = async () => {
      if (categoryId) {
        const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
        setCategory(categoryDoc.data());

        const q = query(collection(db, 'confessions'), where('category', '==', categoryId));
        const querySnapshot = await getDocs(q);
        const confessionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConfessions(confessionsData);
      }
    };

    fetchConfessionsAndCategory();
  }, [categoryId]);

  return (
    <div className="space-y-6 p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">{category?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {confessions.map((confession) => (
          <div key={confession.id}>
            <Link href={`/confession/${confession.id}`}>
              <div className="p-6 border bg-dark-background-light border-gray-700 rounded-lg shadow-md hover:bg-zinc-900 transition duration-300">
                <div className="flex items-center mb-2">
                  <Avatar src={confession.avatar || '/default-avatar.png'} size="40" round />
                  <div className="ml-4">
                    <h2 className="text-sm font-semibold mb-0">{confession.nickname}</h2>
                    <TimeAgo timestamp={confession.date} />
                  </div>
                </div>
                <Link href={`/confession/${confession.id}`}>
                  <h2 className="text-xl font-bold text-blue-500 hover:underline mb-4">
                    {confession.title}
                  </h2>
                </Link>
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
                  {confession.category && (
                    <div className="flex items-center">
                      <span className="text-gray-400 text-xs font-semibold">Category:</span>
                      <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md hover:bg-gray-600 transition duration-300 ml-2">
                        {confession.category}
                      </span>
                    </div>
                  )}
                  {confession.tags && confession.tags.length > 0 && (
                    <div className="flex items-center">
                      <span className="text-gray-400 text-xs font-semibold">Tags:</span>
                      {confession.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md hover:bg-gray-600 transition duration-300 ml-2">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SingleCategory;
