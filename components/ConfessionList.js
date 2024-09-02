'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "/firebase";
import dynamic from "next/dynamic";
import { FaFolder,FaThumbsUp, FaComment, FaMapMarkerAlt, FaVenusMars, FaCalendarAlt } from "react-icons/fa";
import parse from "html-react-parser";
import LoadingSpinner from "@components/LoadingSpinner";
import Image from 'next/image';

const Avatar = dynamic(() => import("react-avatar"), { ssr: false });
const TimeAgo = dynamic(() => import("./TimeAgo"), { ssr: false });

const ConfessionList = () => {
  const [confessions, setConfessions] = useState([]);
  const [sortType, setSortType] = useState('mostRecent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchConfessions = async () => {
        try {
          const confessionSnapshot = await getDocs(collection(db, "confessions"));
          const confessionData = confessionSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const userSnapshot = await getDocs(collection(db, "users"));
          const userData = userSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data();
            return acc;
          }, {});

          const mergedData = confessionData.map((confession) => {
            const user = userData[confession.userId] || {};
            return {
              ...confession,
              avatar: user.avatar,
              nickname: user.nickname || 'Anonymous',
            };
          });

          setConfessions(mergedData);
        } catch (error) {
          console.error("Error fetching confessions: ", error);
        } finally {
          setLoading(false);
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 p-0 text-white">
      <div className="flex justify-end space-x-4 mb-6 items-center">
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
        <div key={confession.id} className="relative">
          <Link href={`/confession/${confession.id}`}>
            <div className="p-6 border bg-dark-background-light border-gray-700 rounded-lg shadow-md hover:bg-zinc-900 transition duration-300 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={confession.avatar || '/default-avatar.png'}
                    alt={confession.nickname || 'Anonymous'}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>

                <div className="ml-4">
                  <h2 className="text-lg font-semibold mb-0">{confession.nickname || 'Anonymous'}</h2>
                  <TimeAgo timestamp={confession.date} />
                </div>
              </div>

              <div className="flex items-center text-gray-400 mb-2">
                {confession.location && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    {confession.location}
                  </div>
                )}
                {confession.gender && (
                  <div className="flex items-center ml-4">
                    <FaVenusMars className="mr-2 text-purple-500" />
                    {confession.gender}
                  </div>
                )}
                {confession.age && (
                  <div className="flex items-center ml-4">
                    <FaCalendarAlt className="mr-2 text-yellow-500" />
                    {confession.age} years old
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
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
                {confession.tags && confession.tags.length > 0 && (
                  <div className="flex items-center">
                    <span className="text-gray-400 text-xs font-semibold">Tags:</span>
                    {confession.tags.map((tag, index) => (
                      <Link key={index} href={`/tags/${encodeURIComponent(tag)}`}>
                        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md hover:bg-gray-600 transition duration-300 ml-2">
                          {tag}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-blue-500 hover:underline mb-4">
                {confession.title}
              </h2>
              <div className="text-gray-300 mb-4 leading-relaxed">
                {parse(truncateContent(confession.content, 200))}
              </div>
              <div className="flex items-center space-x-6 text-gray-400 mb-4">
                <div className="flex items-center">
                  <FaThumbsUp className="mr-2 text-blue-500" /> {confession.likes}
                </div>
                <div className="flex items-center">
                  <FaComment className="mr-2 text-green-500" /> {confession.commentCount}
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ConfessionList;
