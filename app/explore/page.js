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
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories: ', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchTags = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tags'));
        const tagsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching tags: ', error);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchConfessions();
    fetchCategories();
    fetchTags();
  }, []);

  return (
    <div className="p-4 pl-0 pr-0 text-white space-y-10">
      
      {loadingConfessions || loadingCategories || loadingTags ? (
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
