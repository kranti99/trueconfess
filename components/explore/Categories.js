import React from 'react';
import Link from 'next/link';
import LoadingSpinner from "@components/LoadingSpinner";

const Categories = ({ categories, loading }) => {
  if (loading) return <LoadingSpinner />;

  return (
    <section className="categories mb-10">
      <h2 className="text-3xl font-bold mb-6">Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="bg-gradient-to-r from-gray-700 to-gray-800 text-white text-lg p-4 rounded-md shadow-md hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 transition-all duration-300">
              {category.name}
            </Link>
          ))
        ) : (
          <>
            <Link href="/category/humor" className="bg-gradient-to-r from-gray-700 to-gray-800 text-white text-lg p-4 rounded-md shadow-md hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 transition-all duration-300">
              Humor
            </Link>
            <Link href="/category/life" className="bg-gradient-to-r from-gray-700 to-gray-800 text-white text-lg p-4 rounded-md shadow-md hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 transition-all duration-300">
              Life
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default Categories;
