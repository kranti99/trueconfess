'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/firebase';
import LoadingSpinner from "@components/LoadingSpinner"; 
import TrendingConfessions from '@components/explore/TrendingConfessions';
import RecentConfessions from '@components/explore/RecentConfessions';
import Categories from '@components/explore/Categories';
import Tags from '@components/explore/Tags';
import CallToAction from '@components/explore/CallToAction';

const ExplorePage = () => {
  const [confessions, setConfessions] = useState([]);
  const [loadingConfessions, setLoadingConfessions] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchConfessions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'confessions'));
        const confessionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConfessions(confessionsData);
      } catch (error) {
        console.error('Error fetching confessions: ', error);
      } finally {
        setLoadingConfessions(false);
      }
    };

    const fetchCategories = async () => {
      // Replace with actual Firestore fetch logic
      setLoadingCategories(false);
    };

    const fetchTags = async () => {
      // Replace with actual Firestore fetch logic
      setLoadingTags(false);
    };

    fetchConfessions();
    fetchCategories();
    fetchTags();
  }, []);

  return (
    <div className="p-4 text-white mt-12 space-y-10">
      <h1 className="text-4xl font-extrabold mb-6 text-center">Explore Confessions</h1>

      {loadingConfessions && loadingCategories && loadingTags ? (
        <LoadingSpinner />
      ) : (
        <>
          <TrendingConfessions confessions={confessions} loading={loadingConfessions} />
          <Categories categories={categories} loading={loadingCategories} />
          <Tags tags={tags} loading={loadingTags} />
          <RecentConfessions confessions={confessions} loading={loadingConfessions} />
          <CallToAction />
        </>
      )}
    </div>
  );
};

export default ExplorePage;
