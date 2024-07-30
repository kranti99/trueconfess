'use client';

import React, { useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '/firebase';

import dynamic from 'next/dynamic';
const Avatar = dynamic(() => import('react-avatar'), { ssr: false });
const ClipLoader = dynamic(() => import('react-spinners/ClipLoader'), { ssr: false });

// import { ClipLoader } from 'react-spinners';
// import Avatar from 'react-avatar';
import MyConfessionList from '@components/MyConfessionList';

export default function Profile() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const storage = getStorage();

  const handleAvatarChange = async (avatarURL) => {
    setLoading(true);

    try {
      // Update Firebase user profile
      await updateProfile(user, { photoURL: avatarURL });
      setAvatar(avatarURL);

      // Update user confessions with new avatar URL
      const userConfessionsRef = collection(db, 'confessions');
      const q = query(userConfessionsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      for (const docSnapshot of querySnapshot.docs) {
        const docRef = doc(db, 'confessions', docSnapshot.id);
        await updateDoc(docRef, { avatar: avatarURL });
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const avatarURL = await getDownloadURL(storageRef);

      await handleAvatarChange(avatarURL);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Please log in to view your profile.</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar src={avatar || '/default-avatar.png'} size="100" round={true} />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-full">
                <ClipLoader color="#000" size={50} />
              </div>
            )}
          </div>
          <div>
            <input 
              type="file" 
              onChange={handleFileUpload} 
              className="hidden" 
              id="avatarUpload" 
            />
            <label 
              htmlFor="avatarUpload" 
              className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
            >
              Change Avatar
            </label>
          </div>
        </div>
        <div>
          <p className="text-xl"><strong>Email:</strong> {user.email}</p>
          <p className="text-xl"><strong>Username:</strong> {user.displayName}</p>
        </div>
      </div>
      <MyConfessionList user={user} avatar={avatar} />
    </div>
  );
}
