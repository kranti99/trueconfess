import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Heart, MessageSquare, TrendingUp } from 'lucide-react';
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
    <section className="trending py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8 flex items-center">
          <TrendingUp className="mr-2 h-8 w-8" />
          Trending Confessions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {confessions.slice(0, 6).map((confession, index) => (
            <Link href={`/confession/${confession.id}`} key={confession.id} className="group">
              <article className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Avatar name={confession.nickname} size="40" round className="border-2 border-purple-500" />
                      <div className="ml-3">
                        <h3 className="text-sm font-semibold text-gray-200">{confession.nickname}</h3>
                        <TimeAgo timestamp={confession.date} className="text-xs text-gray-400" />
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors duration-300">
                    {confession.title}
                  </h2>
                  <div className="text-gray-300 text-sm leading-relaxed mb-4">
                    {parse(getExcerpt(confession.content, 20))}
                  </div>
                  <div className="flex items-center justify-between text-gray-400 text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Heart className="w-5 h-5 mr-1 text-pink-500" />
                        <span>{confession.likes}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="w-5 h-5 mr-1 text-green-500" />
                        <span>{confession.commentCount}</span>
                      </div>
                    </div>
                    <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold group-hover:bg-pink-600 transition-colors duration-300">
                      Read More
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingConfessions;