'use client';

import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/firebase';
import { FaSearch, FaRegCommentDots } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const stripHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      if (searchTerm.length > 2) {
        setIsSearching(true);
        try {
          const q = collection(db, 'confessions');
          const querySnapshot = await getDocs(q);
          const lowerSearchTerm = searchTerm.toLowerCase();
          const searchResults = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(doc => 
              doc.title.toLowerCase().includes(lowerSearchTerm) ||
              doc.content.toLowerCase().includes(lowerSearchTerm)
            );

          setResults(searchResults);
        } catch (error) {
          console.error('Error fetching search results:', error);
        } finally {
          setIsSearching(false);
          setShowResults(true);
        }
      } else {
        setResults([]);
        setIsSearching(false);
        setShowResults(false);
      }
    };

    fetchResults();
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleResultClick = (id) => {
    setTimeout(() => {
      setShowResults(false);
      router.push(`/confession/${id}`);
    }, 200);
  };

  return (
    <div className="relative flex items-center w-full max-w-lg mx-auto z-40 " ref={searchRef}>
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search"
          className="bg-dark-background text-white px-4 py-2 pl-10 rounded-full w-full border border-gray-700 mb-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
        />
        <FaSearch className="absolute left-3 transform -translate-y-1/2 text-white" style={{'top':'48%'}}/>
      </div>
      {isSearching && (
        <div className="absolute top-12 bg-gray-800 text-white w-full rounded shadow-lg p-2">
          <div className="p-2">Searching...</div>
        </div>
      )}
      {results.length === 0 && !isSearching && searchTerm.length > 2 && showResults && (
        <div className="absolute top-12 bg-gray-800 text-white w-full rounded shadow-lg p-2">
          <div className="p-2">No results found.</div>
        </div>
      )}
      {results.length > 0 && showResults && (
        <div className="absolute top-12 bg-gray-800 text-white w-full rounded shadow-lg p-2">
          {results.map((result, index) => (
            <div
              key={index}
              className="flex items-center p-2 border-b border-gray-700 last:border-b-0 hover:bg-gray-700 cursor-pointer"
              onClick={() => handleResultClick(result.id)}
            >
              <FaRegCommentDots className="text-gray-400 mr-2" />
              <div className="flex-1">
                <div className="font-semibold break-all">{result.title}</div>
                <div className="text-sm text-gray-400 break-all">
                  {stripHtml(result.content).length > 40 ? stripHtml(result.content).substring(0, 40) + '...' : stripHtml(result.content)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
