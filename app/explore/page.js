'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/firebase';
import dynamic from 'next/dynamic';
import { FaThumbsUp, FaComment } from 'react-icons/fa';
import parse from 'html-react-parser';
import LoadingSpinner from "@components/LoadingSpinner"; // Ensure the correct path

const Avatar = dynamic(() => import('react-avatar'), { ssr: false });
const TimeAgo = dynamic(() => import('@components/TimeAgo'), { ssr: false });

const ExplorePage = () => {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfessions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'confessions'));
        const confessionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConfessions(confessionsData);
      } catch (error) {
        console.error('Error fetching confessions: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfessions();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 text-white mt-12">
      <h1 className="text-3xl font-bold mb-6">Explore Confessions</h1>

      {/* Trending Confessions */}
      <section className="trending mb-6">
        <h2 className="text-2xl font-semibold mb-4">Trending Confessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {confessions.slice(0, 6).map((confession) => (
            <div key={confession.id} className="p-4 border bg-dark-background-light border-gray-700 rounded-lg shadow-md hover:bg-zinc-900 transition duration-300">
              <div className="flex items-center mb-2">
                <Avatar name={confession.nickname} size="40" round />
                <div className="ml-4">
                  <h3 className="text-sm font-semibold mb-0">{confession.nickname}</h3>
                  <TimeAgo timestamp={confession.date} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-blue-500 hover:underline mb-4">
                {confession.title}
              </h2>
              <div className="text-gray-300 mb-4">
                {parse(confession.content)}
              </div>
              <div className="flex items-center space-x-4 text-gray-400 mb-4">
                <div className="flex items-center">
                  <FaThumbsUp className="mr-1" /> {confession.likes}
                </div>
                <div className="flex items-center">
                  <FaComment className="mr-1" /> {confession.commentCount}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="categories mb-6">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {/* Example categories, replace with actual data */}
          <Link href="/category/humor" className="bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300">
              Humor
            
          </Link>
          <Link href="/category/life" className="bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300">
              Life
          </Link>
          {/* Add more categories as needed */}
        </div>
      </section>

      {/* Tags */}
      <section className="tags mb-6">
        <h2 className="text-2xl font-semibold mb-4">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {/* Example tags, replace with actual data */}
          <Link href="/tag/funny" className="bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300">
           
              Funny
           </Link>
          <Link href="/tag/relationship" className="bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300">
               Relationship
            
          </Link>
          {/* Add more tags as needed */}
        </div>
      </section>

      {/* Recent Confessions */}
      <section className="recent mb-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Confessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {confessions.slice(6, 12).map((confession) => (
            <div key={confession.id} className="p-4 border bg-dark-background-light border-gray-700 rounded-lg shadow-md hover:bg-zinc-900 transition duration-300">
              <div className="flex items-center mb-2">
                <Avatar name={confession.nickname} size="40" round />
                <div className="ml-4">
                  <h3 className="text-sm font-semibold mb-0">{confession.nickname}</h3>
                  <TimeAgo timestamp={confession.date} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-blue-500 hover:underline mb-4">
                {confession.title}
              </h2>
              <div className="text-gray-300 mb-4">
                {parse(confession.content)}
              </div>
              <div className="flex items-center space-x-4 text-gray-400 mb-4">
                <div className="flex items-center">
                  <FaThumbsUp className="mr-1" /> {confession.likes}
                </div>
                <div className="flex items-center">
                  <FaComment className="mr-1" /> {confession.commentCount}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="call-to-action mb-6">
        <div className="flex justify-center">
          <Link href="/submit-confession" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300">
              Post Your Confession
           
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ExplorePage;
