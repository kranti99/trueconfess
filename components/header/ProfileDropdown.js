'use client';

import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import Link from 'next/link';
import PropTypes from 'prop-types';
import Image from 'next/image';
import Avatar from 'react-avatar';

const ProfileDropdown = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="relative">
      <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center">
        {user && user.photoURL ? (
          <Image
            src={user.photoURL}
            alt="avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <Avatar
            name={user?.displayName || 'User'}
            round={true}
            size="40"
            textSizeRatio={2}
          />
        )}
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
    displayName: PropTypes.string,
  }),
};

export default ProfileDropdown;
