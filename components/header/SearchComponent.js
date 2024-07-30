'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '/firebase';

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      setIsSearching(true);
      const fetchResults = async () => {
        try {
          const q = query(
            collection(db, 'posts'),
            where('title', '>=', searchTerm),
            where('title', '<=', searchTerm + '\uf8ff')
          );
          const querySnapshot = await getDocs(q);
          const searchResults = [];
          querySnapshot.forEach((doc) => {
            searchResults.push({ id: doc.id, ...doc.data() });
          });
          setResults(searchResults);
        } catch (error) {
          console.error('Error fetching search results:', error);
        } finally {
          setIsSearching(false);
        }
      };

      fetchResults();
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [searchTerm]);

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        placeholder="Search"
        className="bg-gray-800 text-white px-4 py-2 rounded-full w-64"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isSearching && (
        <div className="absolute top-12 bg-white text-black w-full rounded shadow-lg p-2">
          <div className="p-2">Searching...</div>
        </div>
      )}
      {results.length > 0 && !isSearching && (
        <div className="absolute top-12 bg-white text-black w-full rounded shadow-lg p-2">
          {results.map((result, index) => (
            <div key={index} className="p-2 border-b last:border-b-0">
              {result.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
