import React, { useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from "@components/LoadingSpinner";

const Categories = ({ categories, loading }) => {
  const [visibleCategories, setVisibleCategories] = useState(20); // Number of categories to display at first
  const [allCategoriesShown, setAllCategoriesShown] = useState(false);

  const handleShowMore = () => {
    if (visibleCategories + 20 >= categories.length) {
      setVisibleCategories(categories.length);
      setAllCategoriesShown(true);
    } else {
      setVisibleCategories(visibleCategories + 20);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <section className="categories mb-10">
      <h2 className="text-3xl font-bold mb-6">Categories</h2>
      <div className="flex flex-wrap gap-4">
        {categories.slice(0, visibleCategories).map((category) => (
          <Link 
            key={category.id} 
            href={`/category/${category.slug}`} 
            className="bg-gradient-to-r from-gray-700 to-gray-800 text-white text-lg p-4 rounded-md shadow-md hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 transition-all duration-300 flex-grow-0 flex-shrink-0">
            {category.name}
          </Link>
        ))}
      </div>
      {!allCategoriesShown && (
        <button
          onClick={handleShowMore}
          className="mt-6 bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition-all duration-300"
        >
          + See More
        </button>
      )}
    </section>
  );
};

export default Categories;
