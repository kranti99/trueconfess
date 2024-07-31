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

  const truncateContent = (content, maxLength) => {
    if (content.length > maxLength) {
      return content.substring(0, maxLength) + "...";
    }
    return content;
  };

  return (
    <div className="space-y-6 p-4 bg-gray-900 text-white">
      {confessions.map((confession) => (
        <Link
          href={`/confession/${confession.id}`}
          key={confession.id}
          className="block p-4 bg-gray-800 rounded shadow-lg flex items-start space-x-4 hover:bg-gray-700 transition"
        >
          <Avatar
            name={confession.anonymous ? "Anonymous User" : confession.nickname}
            src={confession.avatar || "/default-avatar.png"}
            size="30"
            round={true}
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 text-sm text-gray-500">
              <p className="font-bold text-base">
                {confession.anonymous ? "Anonymous User" : confession.nickname}
              </p>
              <TimeAgo timestamp={confession.date} />
            </div>
            <h2 className="text-lg font-semibold mb-2">{confession.title}</h2>
            <div className="text-gray-300">
              {parse(truncateContent(confession.content, 300))}
            </div>
            <div className="text-sm text-gray-400 mt-2 flex space-x-4">
              <span className="flex items-center space-x-1">
                <FaThumbsUp />
                <span>{confession.likes}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaComment />
                <span>{confession.commentCount}</span>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
