import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FaThumbsUp, FaComment } from 'react-icons/fa';
import parse from 'html-react-parser';
import LoadingSpinner from "@components/LoadingSpinner";

const Avatar = dynamic(() => import('react-avatar'), { ssr: false });
const TimeAgo = dynamic(() => import('@components/TimeAgo'), { ssr: false });

// Function to limit the content to a certain number of words
const getExcerpt = (content, wordLimit) => {
  const words = content.split(' ');
  return words.length > wordLimit ? `${words.slice(0, wordLimit).join(' ')}...` : content;
};

const RecentConfessions = ({ confessions, loading }) => {
  const [visibleCount, setVisibleCount] = useState(6);

  const loadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <section className="recent mb-10">
      <h2 className="text-3xl font-bold mb-6">Recent Confessions</h2>
      <div className="columns-2 gap-4">
        {confessions.slice(0, visibleCount).map((confession) => (
          <Link key={confession.id} href={`/confession/${confession.id}`}>
            <div className="relative mb-4 p-4 bg-gray-800 text-white text-lg rounded-md shadow-md hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1 break-inside-avoid cursor-pointer">
              
              {/* Category Ribbon */}
              {confession.category && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-2 py-1 text-xs font-semibold rounded-bl-md">
                  {confession.category}
                </div>
              )}

              <div className="flex items-center mb-3">
                <Avatar name={confession.nickname} size="40" round />
                <div className="ml-3">
                  <h3 className="text-sm font-semibold">{confession.nickname}</h3>
                  <TimeAgo timestamp={confession.date} />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-3 text-blue-400 hover:text-blue-500 transition-colors duration-300">
                {confession.title}
              </h2>
              <div className="text-gray-300 text-sm leading-relaxed mb-4">
                {parse(getExcerpt(confession.content, 20))}
              </div>
              <div className="flex items-center space-x-4 text-gray-400 text-sm">
                <div className="flex items-center">
                  <FaThumbsUp className="mr-1 text-blue-400" /> {confession.likes}
                </div>
                <div className="flex items-center">
                  <FaComment className="mr-1 text-green-400" /> {confession.commentCount}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visibleCount < confessions.length && (
        <div className="text-center mt-6">
          <button 
            onClick={loadMore}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
};

export default RecentConfessions;
