import React from 'react';

const ConfessionItem = ({ confession }) => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-white">{confession.title}</h2>
      <p className="text-gray-400">{confession.content}</p>
      <div className="flex justify-between items-center mt-2 text-gray-500">
        <span>By {confession.nickname}</span>
        <span>{confession.age} {confession.gender}</span>
        <span>{confession.location}</span>
        
        <span>{new Date(confession.date.toDate()).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default ConfessionItem;
