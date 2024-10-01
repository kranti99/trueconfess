'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Heart, MessageSquare, Eye, MapPin, User, Calendar, ChevronDown } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import parse from 'html-react-parser';


// Dynamic imports for avatar and time-ago
const TimeAgo = dynamic(() => import("./TimeAgo"), { ssr: false });

// Utility function to strip HTML tags
const stripHtml = (content) => content.replace(/<\/?[^>]+(>|$)/g, "");

// Utility function to get an excerpt
const getExcerpt = (content, wordLimit) => {
  const words = content.split(' ');
  return words.length > wordLimit ? `${words.slice(0, wordLimit).join(' ')}...` : content;
};

export default function ConfessionList() {
  const [confessions, setConfessions] = useState([]);
  const [sortType, setSortType] = useState('mostRecent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfessions = async () => {
      try {
        const confessionSnapshot = await getDocs(collection(db, "confessions"));
        const confessionData = confessionSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const userSnapshot = await getDocs(collection(db, "users"));
        const userData = userSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});

        const mergedData = confessionData.map((confession) => {
          const user = userData[confession.userId] || {};
          return {
            ...confession,
            avatar: user.avatar,
            nickname: user.nickname || 'Anonymous',
          };
        });

        setConfessions(mergedData);
      } catch (error) {
        console.error("Error fetching confessions: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfessions();
  }, []);

  const sortConfessions = (confessions, type) => {
    if (type === 'mostRecent') {
      return confessions.sort((a, b) => b.date - a.date);
    } else if (type === 'mostCommented') {
      return confessions.sort((a, b) => b.commentCount - a.commentCount);
    }
    return confessions;
  };

  const sortedConfessions = sortConfessions([...confessions], sortType);

  const handleSortChange = (event) => {
    setSortType(event.target.value);
  };

  const incrementViews = async (confessionId) => {
    const confessionRef = doc(db, "confessions", confessionId);
    await updateDoc(confessionRef, {
      views: increment(1)
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto md:p-4 text-gray-300 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold mb-4 mt-4 md:mb-0"
        >
          Confessions
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <span className="text-gray-400 text-sm">Sort by:</span>
          <div className="relative">
            <select
              value={sortType}
              onChange={handleSortChange}
              className="appearance-none p-3 pt-1 pb-1 pr-8 mb-0 border border-gray-600 bg-gray-800 text-sm text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9eff]"
            >
              <option value="mostRecent">Most Recent</option>
              <option value="mostCommented">Most Commented</option>
            </select>
            <ChevronDown className="absolute right-2 top-4 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid gap-4 md:gap-8 md:grid-cols-1"
      >
        {sortedConfessions.map((confession, index) => (
          <motion.div
            key={confession.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={`/confession/${confession.id}`} className="block group no-underline" onClick={() => incrementViews(confession.id)}>
              <Card className="rounded-none md:rounded-xl bg-[#2a2a2a] border-gray-700 transition-all duration-300 group-hover:bg-[#333333] group-hover:shadow-lg h-full flex flex-col transform group-hover:scale-102">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  {/* Avatar and Nickname */}
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

                  {/* Nickname, Location, Gender, Age, and Date */}
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      {/* Nickname */}
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
                      
                      {/* Date */}
                      <div className="text-xs text-gray-400 ml-6">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <TimeAgo timestamp={confession.date} />
                        </span>
                      </div>
                    </div>

                    {/* Location, Gender, Age */}
                    <div className="text-xs text-gray-400 space-x-4 flex items-center mt-1">
                      {/* Location */}
                      {confession.location && (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {confession.location}
                        </span>
                      )}

                      {/* Gender and Age */}
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

                <CardContent className="flex-grow md:pb-3 pb-0">
                  <h2 className="text-xl md:text-2xl font-bold mb-3 text-[#4a9eff] transition-colors duration-300">{confession.title}</h2>
                  <div className="text-sm text-gray-300 mb-4 overflow-hidden main-content">
                      
                    <div className="text-gray-300 text-sm md:text-base leading-relaxed">
                        {parse(stripHtml(getExcerpt(confession.content, 60)))}
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
                      <Heart className="w-5 h-5 group-hover:text-red-500 transition-colors duration-300" />
                      <span className="group-hover:text-red-500 transition-colors duration-300">{confession.likes}</span>
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
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}