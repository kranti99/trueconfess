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

export default function ConfessionList() {
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
    <div className="space-y-6 p-4 bg-gray-900 text-white">
      <div className="flex justify-end space-x-4 mb-4 items-center">
        <span className="text-gray-400">Sort by:</span>
        <select
          className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          value={sortType}
          onChange={handleSortChange}
        >
          <option value="mostRecent">Most Recent</option>
          <option value="mostCommented">Most Commented</option>
        </select>
      </div>
      {sortedConfessions.map((confession) => (
        <Link
          href={`/confession/${confession.id}`}
          key={confession.id}
          className="block p-4 bg-gray-800 rounded shadow-lg flex items-start space-x-4 hover:bg-gray-700 transition"
        >
          <Avatar
            name={confession.isAnonymous ? "Anonymous User" : confession.nickname}
            src={confession.avatar || "/default-avatar.png"}
            size="50"
            round={true}
          />
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-white">{confession.title}</h3>
            <div className="text-sm text-gray-400 flex items-center space-x-2">
              <span>{confession.nickname}</span>
              <span>•</span>
              <TimeAgo timestamp={confession.date} />
              <span>•</span>
              <span>{confession.commentCount} comments</span>
            </div>
            <div className="mt-2 text-gray-200 text-sm">
              {parse(truncateContent(confession.content, 100))}
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <button className="flex items-center text-gray-400 hover:text-blue-500 transition">
                <FaThumbsUp className="mr-1" /> {confession.likes}
              </button>
              <button className="flex items-center text-gray-400 hover:text-blue-500 transition">
                <FaComment className="mr-1" /> {confession.commentCount}
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
