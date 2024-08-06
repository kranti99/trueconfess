'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/firebase';
import { useRouter } from 'next/navigation';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTags = async () => {
      const tagsSnapshot = await getDocs(collection(db, 'tags'));
      const tagsData = tagsSnapshot.docs.map((doc) => doc.data().name);
      setTags(tagsData);
    };

    fetchTags();
  }, []);

  const handleTagClick = (tag) => {
    router.push(`/tags/${tag}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mt-8">Tags</h2>
      <ul className="space-y-2">
        {tags.map((tag) => (
          <li key={tag} onClick={() => handleTagClick(tag)} className="cursor-pointer text-blue-500 hover:underline">
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tags;
