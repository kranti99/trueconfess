'use client';
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Heart, MessageCircle, ChevronDown, ChevronUp } from "lucide-react"

const initialComments = [
  {
    id: 1,
    author: {
      name: "Alice Johnson",
      avatar: "/placeholder.svg"
    },
    content: "This post really resonates with me. I've been in a similar situation and it's comforting to know I'm not alone.",
    likes: 5,
    timestamp: "2 hours ago",
    replies: [
      {
        id: 2,
        author: {
          name: "Bob Smith",
          avatar: "/placeholder.svg"
        },
        content: "I'm glad you found it relatable, Alice. It's important to share these experiences.",
        likes: 2,
        timestamp: "1 hour ago"
      }
    ]
  },
  {
    id: 3,
    author: {
      name: "Charlie Brown",
      avatar: "/placeholder.svg"
    },
    content: "Thank you for sharing your story. It takes courage to be this vulnerable.",
    likes: 3,
    timestamp: "30 minutes ago"
  }
]

function CommentForm({ onSubmit, placeholder = "Write a comment..." }) {
  const [comment, setComment] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(comment)
    setComment("")
  }

  return (
    (<form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px] bg-gray-800 text-gray-100 border-gray-700 resize-none" />
      <Button type="submit" className="bg-[#4a9eff] hover:bg-[#3a8eef] text-white">
        Post Comment
      </Button>
    </form>)
  );
}

function CommentComponent({
  comment,
  level = 0
}) {
  const [isReplying, setIsReplying] = useState(false)
  const [likes, setLikes] = useState(comment.likes)
  const [showReplies, setShowReplies] = useState(true)

  const handleLike = () => {
    setLikes(likes + 1)
  }

  const handleReply = (replyContent) => {
    console.log("Reply to comment", comment.id, ":", replyContent)
    setIsReplying(false)
  }

  return (
    (<div
      className={`py-4 ${level > 0 ? 'ml-8 border-l border-gray-700 pl-4' : ''}`}>
      <div className="flex items-start gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-100">{comment.author.name}</h3>
              <p className="text-xs text-gray-400">{comment.timestamp}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="text-gray-400 hover:text-[#4a9eff]">
                <Heart className="w-4 h-4 mr-1" />
                {likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="text-gray-400 hover:text-[#4a9eff]">
                <MessageCircle className="w-4 h-4 mr-1" />
                Reply
              </Button>
            </div>
          </div>
          <p className="text-gray-300">{comment.content}</p>
          {isReplying && (
            <div className="mt-4">
              <CommentForm onSubmit={handleReply} placeholder="Write a reply..." />
            </div>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="text-gray-400 hover:text-[#4a9eff] mb-2">
            {showReplies ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            {showReplies ? "Hide" : "Show"} Replies
          </Button>
          {showReplies && (
            <div className="space-y-4">
              {comment.replies.map((reply) => (
                <CommentComponent key={reply.id} comment={reply} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>)
  );
}

export function CommentSectionnn() {
  const [comments, setComments] = useState(initialComments)

  const handleNewComment = (content) => {
    const newComment = {
      id: comments.length + 1,
      author: {
        name: "Current User",
        avatar: "/placeholder.svg"
      },
      content,
      likes: 0,
      timestamp: "Just now"
    }
    setComments([newComment, ...comments])
  }

  return (
    (<div className="max-w-2xl mx-auto mt-8 p-4 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-100">Comments</h2>
      <CommentForm onSubmit={handleNewComment} />
      <div className="mt-8 space-y-4">
        {comments.map((comment, index) => (
          <div key={comment.id}>
            <CommentComponent comment={comment} />
            {index < comments.length - 1 && <Separator className="bg-gray-700" />}
          </div>
        ))}
      </div>
    </div>)
  );
}