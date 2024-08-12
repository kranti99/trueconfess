import React from 'react';
import dynamic from 'next/dynamic';
import { FaThumbsUp, FaComment } from 'react-icons/fa';
import parse from 'html-react-parser';
import LoadingSpinner from "@components/LoadingSpinner";

const Avatar = dynamic(() => import('react-avatar'), { ssr: false });
const TimeAgo = dynamic(() => import('@components/TimeAgo'), { ssr: false });

const getExcerpt = (content, wordLimit) => {
  const words = content.split(' ');
  return words.length > wordLimit ? `${words.slice(0, wordLimit).join(' ')}...` : content;
};

const TrendingConfessions = ({ confessions, loading }) => {
  if (loading) return <LoadingSpinner />;

  return (
    <section className="trending mb-10">
      <h2 className="text-2xl font-bold mb-4 text-white">Trending Confessions</h2>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {confessions.slice(0, 6).map((confession) => (
          <div key={confession.id} className="mb-4 p-4 border bg-gray-800 border-gray-700 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1 break-inside-avoid">
            <div className="flex items-center mb-3">
              <Avatar name={confession.nickname} size="40" round />
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-white">{confession.nickname}</h3>
                <TimeAgo timestamp={confession.date} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-blue-400 hover:underline mb-3">
              {confession.title}
            </h2>
            <div className="text-gray-400 text-sm leading-relaxed mb-4">
              {parse(getExcerpt(confession.content, 15))} {/* Display excerpt with 15 words */}
            </div>
            <div className="flex items-center space-x-4 text-gray-500 text-sm">
              <div className="flex items-center">
                <FaThumbsUp className="mr-1 text-blue-500" /> {confession.likes}
              </div>
              <div className="flex items-center">
                <FaComment className="mr-1 text-green-500" /> {confession.commentCount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingConfessions;
