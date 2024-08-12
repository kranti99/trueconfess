import React from 'react';
import Link from 'next/link';
import LoadingSpinner from "@components/LoadingSpinner";

const Tags = ({ tags, loading }) => {
  if (loading) return <LoadingSpinner />;

  return (
    <section className="tags mb-10">
      <h2 className="text-3xl font-bold mb-6">Tags</h2>
      <div className="flex flex-wrap gap-3">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <Link key={tag.id} href={`/tag/${tag.slug}`} className="bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300">
              {tag.name}
            </Link>
          ))
        ) : (
          <>
            <Link href="/tag/funny" className="bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300">
              Funny
            </Link>
            <Link href="/tag/love" className="bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300">
              Love
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default Tags;
