'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/firebase';

const CategoryArchive = () => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      const categoryCollection = collection(db, 'categories');
      const tagCollection = collection(db, 'tags');

      const categorySnapshot = await getDocs(categoryCollection);
      const tagSnapshot = await getDocs(tagCollection);

      const categoryData = categorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const tagData = tagSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCategories(categoryData);
      setTags(tagData);
    };

    fetchCategoriesAndTags();
  }, []);

  return (
    <div className="p-4 text-white mt-12">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.id}`}>
            <div className="p-4 border bg-dark-background-light border-gray-700 rounded-lg shadow-md hover:bg-zinc-900 transition duration-300">
              <h2 className="text-xl font-bold">{category.name}</h2>
              <p className="text-gray-400">{category.description}</p>
              <p className="text-gray-500">Confessions: {category.confessionCount}</p>
            </div>
          </Link>
        ))}
      </div>
      <h1 className="text-3xl font-bold my-6">Tags</h1>
      <div className="flex flex-wrap gap-4">
        {tags.map((tag) => (
          <Link key={tag.id} href={`/tag/${tag.id}`}>
            <span className="bg-gray-700 text-gray-300 text-sm px-3 py-1 rounded-md hover:bg-gray-600 transition duration-300">
              {tag.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryArchive;
