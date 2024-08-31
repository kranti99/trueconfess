'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { FaPencilAlt } from 'react-icons/fa';
import { db } from '/firebase';
import dynamic from 'next/dynamic';

const Avatar = dynamic(() => import('react-avatar'), { ssr: false });
const AvatarEditModal = dynamic(() => import('@components/profile/AvatarEditModal'), { ssr: false });
const MyConfessionList = dynamic(() => import('@components/profile/MyConfessionList'), { ssr: false });

export default function ProfileSection() {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');

  const avatars = [
    '/avatars/male1.png',
    '/avatars/male2.png',
    '/avatars/female1.png',
    '/avatars/female2.png',
    // Add more avatar URLs here
  ];

  useEffect(() => {
    const authInstance = getAuth();
    authInstance.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', currentUser.uid)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          setAvatar(userData.avatar || avatars[0]);
          setNickname(userData.nickname || 'Anonymous');
        } else {
          await setDoc(doc(db, 'users', currentUser.uid), { uid: currentUser.uid, avatar: avatars[0], nickname: 'Anonymous' });
          setAvatar(avatars[0]);
          setNickname('Anonymous');
        }
      }
      setLoading(false);
    });
  }, []);

  const handleAvatarChange = async (avatarURL) => {
    setLoading(true);
    try {
      if (!user) return;

      await updateProfile(user, { photoURL: avatarURL });
      setAvatar(avatarURL);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { avatar: avatarURL });

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
      setEditModalOpen(false);
    }
  };

  const handleNicknameChange = async () => {
    if (!newNickname.trim()) return;

    setLoading(true);
    try {
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { nickname: newNickname });

      setNickname(newNickname);
      setIsEditingNickname(false);
    } catch (error) {
      console.error('Error updating nickname:', error);
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
            <Avatar src={avatar} size="100" round={true} className="object-cover" />
            <button 
              onClick={() => setEditModalOpen(true)} 
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
            >
              <FaPencilAlt />
            </button>
          </div>
          <div>
            <p className="text-xl"><strong>Email:</strong> {user.email}</p>
            <p className="text-xl"><strong>Nickname:</strong> {isEditingNickname ? (
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                onBlur={handleNicknameChange}
                className="border p-2 rounded"
                autoFocus
              />
            ) : (
              <span onClick={() => setIsEditingNickname(true)} className="cursor-pointer">
                {nickname}
              </span>
            )}</p>
          </div>
        </div>
      </div>
      <AvatarEditModal 
        avatars={avatars} 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        onSelect={handleAvatarChange} 
      />
      <MyConfessionList user={user} avatar={avatar} nickname={nickname} />
    </div>
  );
}
