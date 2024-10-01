'use client';

import { useEffect, useState, useMemo } from 'react';
import { doc, getDoc, updateDoc, increment, deleteField } from 'firebase/firestore';
import { db } from '/firebase';
import { getAuth } from 'firebase/auth';
import { Heart, MapPin, User, Calendar } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import parse from 'html-react-parser';
import TimeAgo from '@components/TimeAgo';

export default function ConfessionDetail({ params }) {
  const [confession, setConfession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLikes, setUserLikes] = useState({});
  
  const auth = getAuth();
  const user = auth.currentUser;
  const id = useMemo(() => params.id, [params.id]);

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

          setConfession({
            id: confessionSnap.id,
            ...confessionData,
            avatar: userSnap.exists() ? userSnap.data().avatar : '/default-avatar.png',
            nickname: userSnap.exists() ? userSnap.data().nickname : 'Anonymous',
          });
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
    const confessionRef = doc(db, 'confessions', id);
    const userLikesRef = doc(db, 'users', user.uid);
    const isLiked = userLikes[id];

    try {
      await updateDoc(confessionRef, { likes: increment(isLiked ? -1 : 1) });
      await updateDoc(userLikesRef, { [`likes.${id}`]: isLiked ? deleteField() : true });

      setUserLikes((prevLikes) => ({
        ...prevLikes,
        [id]: !isLiked,
      }));

      setConfession((prevConfession) => ({
        ...prevConfession,
        likes: prevConfession.likes + (isLiked ? -1 : 1),
      }));
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="space-y-6 mt-16 text-white">
      {confession && (
        <Card className="bg-[#2a2a2a] border-gray-700 transition-all group-hover:bg-[#333333] group-hover:shadow-lg">
          <CardHeader>
            <div className="flex items-start space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/author/${confession.nickname}`} className="block no-underline">
                      <Avatar className="w-14 h-14 border-2 border-[#45d754] rounded-full">
                        <AvatarImage src={confession.avatar} alt={confession.nickname} />
                        <AvatarFallback>{confession.nickname.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>View {confession.nickname}'s profile</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/author/${confession.nickname}`} className="font-semibold text-base text-[#45d754] hover:text-[#4a9eff]">
                          {confession.nickname}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>View author's profile</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <span className="ml-6 text-xs text-gray-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <TimeAgo timestamp={confession.date} />
                  </span>
                </div>

                <div className="text-xs text-gray-400 flex items-center space-x-4">
                  {confession.location && (
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {confession.location}
                    </span>
                  )}
                  {confession.gender && (
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {confession.gender}{confession.age && `, ${confession.age}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-[#4a9eff]">{confession.title}</h2>
            <div className="text-base text-gray-300 leading-relaxed">{parse(confession.content)}</div>

            {(confession.categories?.length > 0 || confession.tags?.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {confession.categories?.map((category, index) => (
                  <Link key={index} href={`/category/${category}`} className="no-underline">
                    <Badge variant="outline" className="bg-[#4a9eff] text-black">{category}</Badge>
                  </Link>
                ))}
                {confession.tags?.map((tag, index) => (
                  <Link key={index} href={`/tag/${tag}`} className="no-underline">
                    <Badge variant="outline" className="bg-[#3a3a3a] text-gray-300">{tag}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between items-center pt-3 border-t border-gray-700">
            <button
              className={`flex items-center space-x-1 ${userLikes[id] ? 'text-blue-500' : 'text-gray-400'} hover:text-white`}
              onClick={handleLike}
            >
              <Heart className="w-5 h-5 transition-colors group-hover:text-red-500" />
              <span>{confession.likes}</span>
            </button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
