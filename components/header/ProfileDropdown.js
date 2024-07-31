'use client';

import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import Link from 'next/link';
import PropTypes from 'prop-types';

const ProfileDropdown = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="relative">
      <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center">
        <img
          src={user ? user.photoURL : '/default-avatar.png'}
          alt="avatar"
          className="w-10 h-10 rounded-full"
        />
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
          {user ? (
            <>
              <Link href="/profile" className="block px-4 py-2 text-gray-800">
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-gray-800 w-full text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="block px-4 py-2 text-gray-800">
              Login
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

ProfileDropdown.propTypes = {
  user: PropTypes.shape({
    photoURL: PropTypes.string,
  }),
};

export default ProfileDropdown;
