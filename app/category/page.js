'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/firebase';
import LoadingSpinner from '/components/LoadingSpinner'; 
import Categories from '@components/explore/Categories';
import Tags from '@components/explore/Tags';

const CategoryArchive = () => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, 'categories'));
        const categoryData = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoryData);
      } catch (error) {
        console.error('Error fetching categories: ', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchTags = async () => {
      try {
        const tagSnapshot = await getDocs(collection(db, 'tags'));
        const tagData = tagSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTags(tagData);
      } catch (error) {
        console.error('Error fetching tags: ', error);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchCategories();
    fetchTags();
  }, []);

  return (
    <div className="p-4 text-white mt-12">
      {loadingCategories || loadingTags ? (
        <LoadingSpinner />
      ) : (
        <>
          <Categories categories={categories} loading={loadingCategories} />

          <Tags tags={tags} loading={loadingTags} />
        </>
      )}
    </div>
  );
};

export default CategoryArchive;
