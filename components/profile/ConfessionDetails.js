import dynamic from 'next/dynamic';
import Link from "next/link";

import { FaTags, FaFolder, FaVenusMars } from 'react-icons/fa';

const Avatar = dynamic(() => import('react-avatar'), { ssr: false });
const TimeAgo = dynamic(() => import('@components/TimeAgo'), { ssr: false });

export default function ConfessionDetails({ confession }) {
  return (
    <div className="flex items-start p-4 bg-gray-800 rounded-lg">
      <Avatar name={confession.displayName || 'Anonymous'} round={true} size="50" className="mr-4" />
      
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{confession.title}</h2>
        <p className="text-gray-400 mb-2">
          {confession.displayName || 'Anonymous'} | {confession.age} {confession.gender && `| ${confession.gender}`} | {confession.location}
        </p>
        <p className="text-gray-400 mb-4">
          <TimeAgo timestamp={confession.date} />
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
          {confession.gender && (
            <div className="flex items-center">
              <FaVenusMars className="mr-1" />
              <span>{confession.gender}</span>
            </div>
          )}

            {confession.categories && confession.categories.length > 0 && (
                      
                    <div className="flex items-center">
                        <FaFolder className="mr-1" />
                      <span className="text-gray-400 text-xs font-semibold">Category:</span>
                      {confession.categories.map((cat, index) => (
                        <Link key={index} href={`/category/${encodeURIComponent(cat)}`}>
                          <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md hover:bg-gray-600 transition duration-300 ml-2">
                            {cat}
                          </span>
                        </Link>
                      ))}
                    </div>
            )}

          {confession.tags && confession.tags.length > 0 && (
                  <div className="flex items-center">
                      <FaTags className="mr-1" />
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
      </div>
    </div>
  );
}
