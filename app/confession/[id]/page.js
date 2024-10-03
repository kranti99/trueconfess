'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, increment, deleteField, setDoc } from 'firebase/firestore';
import { db } from '/firebase';
import CommentList from '@components/CommentList';
import CommentForm from '@components/CommentForm';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Heart, MessageSquare, Eye, MapPin, User, Calendar, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TimeAgo from '@components/TimeAgo';
import parse from 'html-react-parser';
import { getAuth } from 'firebase/auth';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfessionDetail({ params }) {
  const pathname = usePathname();
  const router = useRouter();
  const [confession, setConfession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLikes, setUserLikes] = useState({});
  const [userData, setUserData] = useState(null); 
  const [likedConfession, setLikedConfession] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  const id = params.id;

  useEffect(() => {
    if (!id) {
      setError('No confession ID found');
      setLoading(false);
      return;
    }

    const fetchConfession = async () => {
      try {
        const confessionDocRef = doc(db, 'confessions', id);
        const confessionSnap = await getDoc(confessionDocRef);

        if (confessionSnap.exists()) {
          const confessionData = confessionSnap.data();

          const userDocRef = doc(db, 'users', confessionData.userId);
          const userSnap = await getDoc(userDocRef);

          const mergedData = {
            id: confessionSnap.id,
            ...confessionData,
            avatar: userSnap.exists() ? userSnap.data().avatar : '/default-avatar.png',
            nickname: userSnap.exists() ? userSnap.data().nickname : 'Anonymous',
          };

          setConfession(mergedData);
        } else {
          setError('Confession not found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfession();
  }, [id]);

  useEffect(() => {
    if (user) {
      const fetchUserLikes = async () => {
        const userLikesRef = doc(db, 'users', user.uid);
        const userLikesSnap = await getDoc(userLikesRef);
        if (userLikesSnap.exists()) {
          setUserLikes(userLikesSnap.data().likes || {});
        }
      };

      fetchUserLikes();
    }
  }, [user]);

  const handleLike = async () => {
    if (!user) {
      // Handle the case when the user is not logged in
      // For example, redirect to login page or show a message
      return;
    }

    const isLiked = userLikes[id];

    setConfession((prevConfession) => ({
      ...prevConfession,
      likes: isLiked ? Math.max((prevConfession.likes || 0) - 1, 0) : (prevConfession.likes || 0) + 1,
    }));

    setUserLikes((prevLikes) => ({
      ...prevLikes,
      [id]: !isLiked
    }));

    if (!isLiked) {
      setLikedConfession(id);
      setTimeout(() => setLikedConfession(null), 1000);
    }

    try {
      const confessionRef = doc(db, 'confessions', id);
      const userLikesRef = doc(db, 'users', user.uid);

      // Check if the user document exists
      const userDoc = await getDoc(userLikesRef);

      if (!userDoc.exists()) {
        // If the user document doesn't exist, create it
        await setDoc(userLikesRef, { likes: {} });
      }

      if (!isLiked) {
        await updateDoc(confessionRef, { likes: increment(1) });
        await updateDoc(userLikesRef, { [`likes.${id}`]: true });
      } else {
        await updateDoc(confessionRef, { likes: increment(-1) });
        await updateDoc(userLikesRef, { [`likes.${id}`]: deleteField() });
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert the optimistic update if there's an error
      setConfession((prevConfession) => ({
        ...prevConfession,
        likes: isLiked ? (prevConfession.likes || 0) + 1 : Math.max((prevConfession.likes || 0) - 1, 0),
      }));
      setUserLikes((prevLikes) => ({
        ...prevLikes,
        [id]: isLiked
      }));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="space-y-6 mt-2 md:mt-0 text-white">
      {confession && (
        <>
          <Card className="md:rounded-sm rounded-none bg-[#2a2a2a] border-gray-700 transition-all duration-300 group-hover:bg-[#333333] group-hover:shadow-lg h-full flex flex-col transform group-hover:scale-102">
            <CardHeader className="pb-4">
              <div className="flex items-start space-x-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/author/${confession.nickname}`} className="block no-underline">
                        <Avatar className="w-14 h-14 border-2 border-[#45d754] rounded-full transition-all duration-300 group-hover:border-[#4a9eff] shadow-lg">
                          <AvatarImage src={confession.avatar || "/default-avatar.png"} alt={confession.nickname} />
                          <AvatarFallback>{confession.nickname.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View {confession.nickname}'s profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/author/${confession.nickname}`} className="font-semibold text-base text-[#45d754] transition-colors duration-300 hover:text-[#4a9eff] no-underline">
                              {confession.nickname}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View author's profile</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <div className="text-xs text-gray-400 ml-6">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <TimeAgo timestamp={confession.date} />
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 space-x-4 flex items-center mt-1">
                    {confession.location && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {confession.location}
                      </span>
                    )}

                    {confession.gender && (
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {confession.gender}{confession.gender && confession.age && <span>,&nbsp;</span>} {confession.age && <span>{confession.age}</span>}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-grow pb-3">
              <h2 className="text-xl md:text-2xl font-bold mb-3 text-[#4a9eff] transition-colors duration-300 break-all">{confession.title}</h2>
              <div className="text-sm text-gray-300 mb-4 overflow-hidden main-content">
                <div className="text-gray-300 text-sm md:text-base leading-relaxed single-content break-all">
                  {parse(confession.content)}
                </div>
              </div>

              {(confession.categories?.length > 0 || confession.tags?.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {confession.categories && confession.categories.map((category, index) => (
                    <Link key={index} href={`/category/${category}`} className="block no-underline">
                      <Badge variant="outline" className="bg-[#4a9eff] text-[#1c1c1c] transition-colors duration-300">
                        {category}
                      </Badge>
                    </Link>
                  ))}
                  {confession.tags && confession.tags.map((tag, index) => (
                    <Link key={index} href={`/tag/${tag}`} className="block no-underline">
                      <Badge variant="outline" className="text-gray-300 bg-[#3a3a3a] transition-colors duration-300">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between items-center pt-3 pb-3 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-2 mr-16 group">
                  <button
                    className={`flex items-center space-x-1 ${userLikes[id] ? 'text-red-500' : 'text-gray-400'} hover:text-white`}
                    onClick={handleLike}
                  >
                    <Heart 
                      className={`w-5 h-5 transition-all duration-300 ${
                        userLikes[id] 
                          ? 'text-red-500 fill-red-500' 
                          : 'text-gray-400 fill-transparent group-hover:text-red-500'
                      }`} 
                    />
                    <span className={`transition-colors duration-300 ${userLikes[id] ? 'text-red-500' : 'group-hover:text-red-500'}`}>
                      {confession.likes || 0}
                    </span>
                  </button>
                </div>
                <div className="flex items-center space-x-2 mr-16 group">
                  <MessageSquare className="w-5 h-5 group-hover:text-[#4a9eff] transition-colors duration-300" />
                  <span className="group-hover:text-[#4a9eff] transition-colors duration-300">{confession.commentCount}</span>
                </div>
                <div className="flex items-center space-x-2 group">
                  <Eye className="w-5 h-5 group-hover:text-[#45d754] transition-colors duration-300" />
                  <span className="group-hover:text-[#45d754] transition-colors duration-300">{confession.views}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
          <CommentForm confessionId={id} />
          <CommentList confessionId={id} />
        </>
      )}
      <AnimatePresence>
        {likedConfession === id && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
          >
            <Heart className="w-24 h-24 text-red-500 fill-current" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}