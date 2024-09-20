'use client'

import { useState } from 'react'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Heart, MessageCircle, Eye, MapPin, User, Calendar, Share2, Bookmark } from "lucide-react"
import DOMPurify from 'dompurify'

// Mock data for a single post
const post = {
  id: 1,
  author: {
    name: "Anonymous",
    avatar: "/placeholder.svg",
    bio: "Just another human trying to figure out life."
  },
  title: "The Hidden Truth Behind My Lonely Nights",
  category: "Relationships",
  tags: ["Friendship", "Loneliness", "SelfDoubt"],
  content: `
    <p>I've been carrying a secret for years that has been eating away at me, and I'm finally ready to let it out. When I was in my early twenties, I made a decision that I now regret deeply. I was in a relationship with someone who truly loved me, but I was too focused on my career and personal growth.</p>
    <h2>The Decision That Changed Everything</h2>
    <p>I chose to end that relationship, thinking I needed to be alone to find myself. Little did I know, that decision would lead to years of loneliness and self-doubt.</p>
    <ul>
      <li>I pushed away someone who genuinely cared for me.</li>
      <li>I focused solely on my career, neglecting my personal life.</li>
      <li>I convinced myself that being alone was what I needed.</li>
    </ul>
    <h2>The Consequences</h2>
    <p>Now, years later, I find myself successful in my career but emotionally unfulfilled. The loneliness creeps in every night, reminding me of what I lost.</p>
    <blockquote>Sometimes, the hardest person to forgive is yourself.</blockquote>
    <p>I'm sharing this story not for sympathy, but as a cautionary tale. Cherish the genuine connections in your life, and don't let ambition blind you to what truly matters.</p>
  `,
  likes: 2,
  comments: 0,
  views: 150,
  location: "Sydney, Australia",
  gender: "Other",
  age: 25,
  timePosted: "26 days ago"
}

export function SinglePost() {
  const [likes, setLikes] = useState(post.likes)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => prev - 1)
    } else {
      setLikes(prev => prev + 1)
    }
    setIsLiked(prev => !prev)
  }

  const sanitizedContent = DOMPurify.sanitize(post.content)

  return (
    (<div className="container mx-auto p-4 bg-[#1c1c1c] text-gray-300 min-h-screen">
      <Card className="bg-[#2a2a2a] border-gray-700 shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/author/${post.author.name}`} className="block">
                    <Avatar className="w-16 h-16 border-2 border-[#45d754]">
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View {post.author.name}&apos;s profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div>
              <Link
                href={`/author/${post.author.name}`}
                className="font-semibold text-lg text-[#45d754] hover:underline">
                {post.author.name}
              </Link>
              <p className="text-sm text-gray-400">{post.author.bio}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {post.location}
                </span>
                <span className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {post.gender}, {post.age} years old
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {post.timePosted}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h1 className="text-3xl font-bold mb-4 text-[#4a9eff]">{post.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="bg-[#45d754] text-[#1c1c1c]">
              {post.category}
            </Badge>
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-gray-300">
                {tag}
              </Badge>
            ))}
          </div>
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </CardContent>
        <CardFooter
          className="flex justify-between items-center pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
              onClick={handleLike}>
              <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
              <span>{likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 hover:text-[#4a9eff]">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </Button>
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.views}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-[#4a9eff] border-[#4a9eff] hover:bg-[#4a9eff] hover:text-[#1c1c1c]">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[#4a9eff] border-[#4a9eff] hover:bg-[#4a9eff] hover:text-[#1c1c1c]">
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>)
  );
}