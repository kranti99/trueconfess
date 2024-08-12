import React from 'react';
import dynamic from 'next/dynamic';
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

const TrendingConfessions = ({ confessions, loading }) => {
  if (loading) return <LoadingSpinner />;

  return (
    <section className="trending mb-10">
      <h2 className="text-3xl font-bold mb-6 text-white">Trending Confessions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {confessions.slice(0, 6).map((confession) => (
          <div key={confession.id} className="p-6 border bg-gray-800 border-gray-700 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center mb-4">
              <Avatar name={confession.nickname} size="50" round />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">{confession.nickname}</h3>
                <TimeAgo timestamp={confession.date} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-blue-400 hover:underline mb-4">
              {confession.title}
            </h2>
            <div className="text-gray-400 leading-relaxed mb-6">
              {parse(getExcerpt(confession.content, 20))} {/* Display excerpt with 20 words */}
            </div>
            <div className="flex items-center space-x-6 text-gray-500">
              <div className="flex items-center">
                <FaThumbsUp className="mr-2 text-blue-500" /> {confession.likes}
              </div>
              <div className="flex items-center">
                <FaComment className="mr-2 text-green-500" /> {confession.commentCount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingConfessions;
