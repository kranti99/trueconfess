'use client'

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Heart, MessageCircle, Eye, MapPin, User, Calendar } from "lucide-react"

// Mock data for blog posts
const blogPosts = [
  {
    id: 1,
    author: {
      name: "Anonymous",
      avatar: "/placeholder.svg"
    },
    title: "The Hidden Truth Behind My Lonely Nights",
    category: "Relationships",
    tags: ["Friendship", "Loneliness", "SelfDoubt"],
    excerpt: "I've been carrying a secret for years that has been eating away at me, and I'm finally ready to let it out. When I was in my early twenties, I made a decision that I now regret deeply. I was in a r...",
    likes: 2,
    comments: 0,
    views: 150,
    location: "Sydney, Australia",
    gender: "Other",
    age: 25,
    timePosted: "26 days ago"
  },
  {
    id: 2,
    author: {
      name: "TechEnthusiast",
      avatar: "/placeholder.svg"
    },
    title: "The Future of AI: Promises and Perils",
    category: "Technology",
    tags: ["AI", "Ethics", "Innovation"],
    excerpt: "As we stand on the brink of a new era in artificial intelligence, it's crucial to examine both the incredible potential and the possible risks that come with this rapidly evolving technology. From...",
    likes: 45,
    comments: 12,
    views: 1023,
    location: "San Francisco, USA",
    gender: "Female",
    age: 32,
    timePosted: "3 days ago"
  }
]

export function BlogPostList() {
  return (
    (<div className="container mx-auto p-4 bg-[#1c1c1c] text-gray-300 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-[#4a9eff] text-center">Blog Archive</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {blogPosts.map((post) => (
          <Link href={`/post/${post.id}`} key={post.id} className="block group">
            <Card
              className="bg-[#2a2a2a] border-gray-700 transition-all duration-300 group-hover:bg-[#333333] group-hover:shadow-lg h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/author/${post.author.name}`} className="block">
                          <Avatar
                            className="w-12 h-12 border-2 border-[#45d754] transition-all duration-300 group-hover:border-[#4a9eff]">
                            <AvatarImage src={post.author.avatar} alt={post.author.name} />
                            <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View {post.author.name}'s profile</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/author/${post.author.name}`}
                            className="font-semibold text-sm text-[#45d754] hover:underline">
                            {post.author.name}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View author's profile</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <p className="text-xs text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {post.timePosted}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <h2 className="text-xl font-bold mb-2 text-[#4a9eff] group-hover:underline">{post.title}</h2>
                <div className="flex items-center space-x-4 text-xs text-gray-400 mb-2">
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {post.location}
                  </span>
                  <span className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {post.gender}, {post.age} years old
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3 line-clamp-3">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#45d754] text-[#1c1c1c] group-hover:bg-[#4a9eff]">
                    {post.category}
                  </Badge>
                  {post.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-gray-300 group-hover:bg-[#4a4a4a]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter
                className="flex justify-between items-center pt-2 border-t border-gray-700">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.views}</span>
                  </span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>)
  );
}