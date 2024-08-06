import { getFirestore, collection, getDocs } from 'firebase/firestore';

import { useEffect, useState } from 'react';


const fetchCategories = async () => {
    const db = getFirestore();
    const categoriesCollection = collection(db, 'categories');
    const categorySnapshot = await getDocs(categoriesCollection);
    const categoryList = categorySnapshot.docs.map(doc => doc.data());
    return categoryList;
  };
  
  const fetchTags = async () => {
    const db = getFirestore();
    const tagsCollection = collection(db, 'tags');
    const tagSnapshot = await getDocs(tagsCollection);
    const tagList = tagSnapshot.docs.map(doc => doc.data());
    return tagList;
  };
  
const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const getCategoriesAndTags = async () => {
      const categoriesData = await fetchCategories();
      const tagsData = await fetchTags();
      setCategories(categoriesData);
      setTags(tagsData);
    };

    getCategoriesAndTags();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Popular Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <div key={index} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
            <p className="text-gray-600 mb-4">Popularity: {category.popularity}</p>
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold mt-8 mb-4">Popular Tags</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag, index) => (
          <div key={index} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{tag.name}</h2>
            <p className="text-gray-600 mb-4">Popularity: {tag.popularity}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
