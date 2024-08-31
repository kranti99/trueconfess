'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { FaTimes } from 'react-icons/fa';

const Avatar = dynamic(() => import('react-avatar'), { ssr: false });

export default function AvatarEditModal({ avatars, isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg h-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Choose an Avatar</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {avatars.map((avatar, index) => (
            <div 
              key={index} 
              onClick={() => onSelect(avatar)}
              className="cursor-pointer hover:opacity-75"
            >
              <Avatar src={avatar} size="80" round={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
