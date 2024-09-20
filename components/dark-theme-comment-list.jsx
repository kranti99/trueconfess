'use client'

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CheckCircle, Reply, Send, MoreHorizontal, Trash, Edit } from 'lucide-react'

// Mock data
const mockComments = [
  {
    id: '1',
    content: 'This is a great post!',
    userId: 'user1',
    userEmail: 'user1@example.com',
    avatar: '/placeholder.svg?height=40&width=40',
    nickname: 'User One',
    date: new Date(2023, 5, 1).toISOString(),
    parentId: null,
    likes: 5,
  },
  {
    id: '2',
    content: 'I totally agree with you.',
    userId: 'user2',
    userEmail: 'user2@example.com',
    avatar: '/placeholder.svg?height=40&width=40',
    nickname: 'User Two',
    date: new Date(2023, 5, 2).toISOString(),
    parentId: '1',
    likes: 3,
  },
  {
    id: '3',
    content: 'Interesting perspective!',
    userId: 'user3',
    userEmail: 'user3@example.com',
    avatar: '/placeholder.svg?height=40&width=40',
    nickname: 'User Three',
    date: new Date(2023, 5, 3).toISOString(),
    parentId: null,
    likes: 2,
  },
]

const mockUser = {
  uid: 'user1',
  email: 'user1@example.com',
  displayName: 'User One',
  photoURL: '/placeholder.svg?height=40&width=40',
}

function TimeAgo({ timestamp }) {
  const date = new Date(timestamp)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} months ago`
  const years = Math.floor(months / 12)
  return `${years} years ago`
}

function LikeButton({ itemId, itemType, initialLikes = 0 }) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1)
    } else {
      setLikes(likes + 1)
    }
    setIsLiked(!isLiked)
  }

  return (
    (<Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      className={`p-0 h-auto ${isLiked ? 'text-primary' : ''}`}>👍 {likes}
    </Button>)
  );
}

export function DarkThemeCommentList({ confessionId = '1' }) {
  const [comments, setComments] = useState(mockComments)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [user, setUser] = useState(mockUser)
  const [repliesVisible, setRepliesVisible] = useState({})

  const handleDelete = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId))
    setIsModalOpen(false)
  }

  const handleEdit = (commentId) => {
    setEditingCommentId(commentId)
    const commentToEdit = comments.find((comment) => comment.id === commentId)
    setEditContent(commentToEdit ? commentToEdit.content : '')
  }

  const handleEditSubmit = () => {
    setComments(comments.map(comment => 
      comment.id === editingCommentId ? { ...comment, content: editContent } : comment))
    setEditingCommentId(null)
  }

  const handleReply = () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    if (replyContent.trim() === '') return

    const newComment = {
      id: String(comments.length + 1),
      content: replyContent,
      userId: isAnonymous ? 'anonymous' : user.uid,
      userEmail: isAnonymous ? 'anonymous' : user.email,
      avatar: isAnonymous ? '/placeholder.svg?height=40&width=40' : user.photoURL,
      nickname: isAnonymous ? 'Anonymous' : user.displayName,
      date: new Date().toISOString(),
      parentId: replyTo,
      likes: 0,
    }

    setComments([...comments, newComment])
    setReplyContent('')
    setReplyTo(null)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const toggleReplies = (commentId) => {
    setRepliesVisible((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  if (loading) return <p className="text-muted-foreground">Loading comments...</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    (<div className="space-y-4">
      {showSuccessMessage && (
        <div
          className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-md shadow-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Comment posted successfully!
        </div>
      )}
      <ScrollArea className="h-[600px] pr-4">
        {comments.map((comment) => (
          <div key={comment.id} className={`mb-4 ${comment.parentId ? 'ml-8' : ''}`}>
            <div className="flex items-start space-x-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={comment.avatar} alt={comment.nickname} />
                <AvatarFallback>{comment.nickname[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{comment.nickname}</p>
                  <TimeAgo timestamp={comment.date} className="text-xs text-muted-foreground" />
                </div>
                <div className="text-sm text-foreground">
                  {editingCommentId === comment.id ? (
                    <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                  ) : (
                    comment.content
                  )}
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <LikeButton
                    itemId={comment.id}
                    itemType={`confessions/${confessionId}/comments`}
                    initialLikes={comment.likes} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => {
                      if (!user) {
                        setIsAuthModalOpen(true)
                      } else {
                        setReplyTo(comment.id)
                      }
                    }}>
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                  {comments.filter(reply => reply.parentId === comment.id).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => toggleReplies(comment.id)}>
                      {repliesVisible[comment.id] ? 'Hide Replies' : 'Show Replies'}
                    </Button>
                  )}
                </div>
              </div>
              {user && user.uid === comment.userId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(comment.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setCommentToDelete(comment.id)
                        setIsModalOpen(true)
                      }}>
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {editingCommentId === comment.id && (
              <div className="flex justify-end mt-2 space-x-2">
                <Button variant="outline" size="sm" onClick={() => setEditingCommentId(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEditSubmit}>
                  Save
                </Button>
              </div>
            )}
            {replyTo === comment.id && (
              <div className="mt-4 ml-14">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..." />
                <div className="flex justify-between items-center mt-2">
                  <Button onClick={handleReply} size="sm" className="flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                    <Label htmlFor="anonymous" className="text-sm">Post as Anonymous</Label>
                  </div>
                </div>
              </div>
            )}
            {repliesVisible[comment.id] && (
              <div className="ml-14 mt-4 space-y-4">
                {comments
                  .filter((reply) => reply.parentId === comment.id)
                  .map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={reply.avatar} alt={reply.nickname} />
                        <AvatarFallback>{reply.nickname[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{reply.nickname}</p>
                          <TimeAgo timestamp={reply.date} className="text-xs text-muted-foreground" />
                        </div>
                        <div className="text-sm text-foreground">{reply.content}</div>
                        <div className="flex items-center space-x-4 text-xs">
                          <LikeButton
                            itemId={reply.id}
                            itemType={`confessions/${confessionId}/comments`}
                            initialLikes={reply.likes} />
                        </div>
                      </div>
                      {user && user.uid === reply.userId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(reply.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setCommentToDelete(reply.id)
                                setIsModalOpen(true)
                              }}>
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
      {!user && (
        <div className="flex justify-center mt-4">
          <Button onClick={() => setIsAuthModalOpen(true)}>
            Login to comment
          </Button>
        </div>
      )}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(commentToDelete)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? 'Login' : 'Sign Up'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
              {authMode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </Button>
            <Button onClick={() => setIsAuthModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>)
  );
}