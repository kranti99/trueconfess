'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '/firebase';
import dynamic from 'next/dynamic';

const Avatar = dynamic(() => import('react-avatar'), { ssr: false });
const ClipLoader = dynamic(() => import('react-spinners/ClipLoader'), { ssr: false });
const MyConfessionList = dynamic(() => import('@components/profile/MyConfessionList'), { ssr: false });

export default function Profile() {
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const storage = getStorage();

  useEffect(() => {
    const authInstance = getAuth();
    authInstance.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAvatar(currentUser.photoURL || '');
      }
      setLoading(false);
    });
    setAuth(authInstance);
  }, []);

  const handleAvatarChange = async (avatarURL) => {
    setLoading(true);
    try {
      await updateProfile(user, { photoURL: avatarURL });
      setAvatar(avatarURL);

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
      if (!user) {
        throw new Error('User not authenticated');
      }

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

  if (loading) return <p>Loading...</p>;

  if (!user) return <p>Please log in to view your profile.</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar src={avatar || '/default-avatar.png'} size="100" round={true} className="object-cover"/>
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
