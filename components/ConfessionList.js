'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "/firebase";
import dynamic from "next/dynamic";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import parse from "html-react-parser";

const Avatar = dynamic(() => import("react-avatar"), { ssr: false });
const TimeAgo = dynamic(() => import("./TimeAgo"), { ssr: false });

const ConfessionList = () => {
  const [confessions, setConfessions] = useState([]);
  const [sortType, setSortType] = useState('mostRecent');

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchConfessions = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "confessions"));
          const confessionsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setConfessions(confessionsData);
        } catch (error) {
          console.error("Error fetching confessions: ", error);
        }
      };

      fetchConfessions();
    }
  }, []);

  const sortConfessions = (confessions, type) => {
    if (type === 'mostRecent') {
      return confessions.sort((a, b) => b.date - a.date);
    } else if (type === 'mostCommented') {
      return confessions.sort((a, b) => b.commentCount - a.commentCount);
    }
    return confessions;
  };

  const sortedConfessions = sortConfessions([...confessions], sortType);

  const handleSortChange = (event) => {
    setSortType(event.target.value);
  };

  const truncateContent = (content, maxLength) => {
    if (content.length > maxLength) {
      return content.substring(0, maxLength) + "...";
    }
    return content;
  };

  return (
    <div className="space-y-6 p-4 text-white">
      <div className="flex justify-end space-x-4 mb-4 items-center">
        <span className="text-gray-400">Sort by:</span>
        <select
          value={sortType}
          onChange={handleSortChange}
          className="max-w-64 m-0 p-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:border-blue-500 transition duration-300"
        >
          <option value="mostRecent">Most Recent</option>
          <option value="mostCommented">Most Commented</option>
        </select>
      </div>
      {sortedConfessions.map((confession) => (
        <div key={confession.id}>
          <Link href={`/confession/${confession.id}`}>
            <div className="p-6 border bg-dark-background-light border-gray-700 rounded-lg shadow-md !hover:bg-gray-800 transition duration-300" style={{ background: '#262626' }}>
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
                {confession.category && confession.category.length > 0 && (
                  <div className="flex items-center">
                    <span className="text-gray-400 text-xs font-semibold">Category:</span>
                    {confession.category.map((cat, index) => (
                      <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md hover:bg-gray-600 transition duration-300 ml-2">
                        {cat}
                      </span>
                    ))}
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
  );
};

export default ConfessionList;
