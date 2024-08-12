import React from 'react';
import dynamic from 'next/dynamic';
import { FaThumbsUp, FaComment } from 'react-icons/fa';
import parse from 'html-react-parser';
import LoadingSpinner from "@components/LoadingSpinner";

const Avatar = dynamic(() => import('react-avatar'), { ssr: false });
const TimeAgo = dynamic(() => import('@components/TimeAgo'), { ssr: false });

const RecentConfessions = ({ confessions, loading }) => {
  if (loading) return <LoadingSpinner />;

  return (
    <section className="recent mb-10">
      <h2 className="text-3xl font-bold mb-6">Recent Confessions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {confessions.slice(6, 12).map((confession) => (
          <div key={confession.id} className="p-6 border bg-dark-background-light border-gray-700 rounded-lg shadow-lg hover:bg-zinc-900 transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center mb-4">
              <Avatar name={confession.nickname} size="50" round />
              <div className="ml-4">
                <h3 className="text-lg font-semibold">{confession.nickname}</h3>
                <TimeAgo timestamp={confession.date} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-blue-400 hover:underline mb-4">
              {confession.title}
            </h2>
            <div className="text-gray-400 leading-relaxed mb-6">
              {parse(confession.content)}
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

export default RecentConfessions;
