'use client';

import React from 'react';
import Tags from '@components/Tags';
import Categories from '@components/Categories';

const CategoriesTags = () => {
  return (
    <div className="p-6">
      <Categories />
      <Tags />
    </div>
  );
};

export default CategoriesTags;
