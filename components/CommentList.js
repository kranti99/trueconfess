'use client'

import React, { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { collection, query, onSnapshot, deleteDoc, doc, setDoc, updateDoc, orderBy, limit, startAfter, where, Timestamp, getDocs } from 'firebase/firestore'
import { db } from '/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import TimeAgo from './TimeAgo'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, MessageCircle, MoreVertical, Edit, Trash2, Send, CheckCircle } from 'lucide-react'
import parse from 'html-react-parser'
import Modal from '@/components/modal'
import AuthForm from './AuthForm'
import LikeButton from './LikeButton'

import 'react-quill/dist/quill.bubble.css'
import 'quill-emoji/dist/quill-emoji.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

const modules = {
  toolbar: [
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'align': [] }],
    ['emoji'],
    ['clean']
  ],
  "emoji-toolbar": true,
  "emoji-textarea": true,
  "emoji-shortname": true,
}

export default function CommentList({ confessionId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [user, setUser] = useState(null)
  const [repliesVisible, setRepliesVisible] = useState({})
  const [sortBy, setSortBy] = useState('latest')
  const [lastVisible, setLastVisible] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const auth = getAuth()

  const fetchComments = useCallback(() => {
    if (!confessionId) return

    let q = query(
      collection(db, 'confessions', confessionId, 'comments'),
      where('replyTo', '==', null),
      orderBy(sortBy === 'latest' ? 'date' : 'likes', 'desc'),
      limit(10)
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedComments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date instanceof Timestamp ? doc.data().date.toDate() : new Date(doc.data().date)
      }))

      // Fetch reply counts for each comment
      const replyPromises = fetchedComments.map(comment =>
        fetchReplyCount(comment.id)
      )

      Promise.all(replyPromises).then(replyCounts => {
        const commentsWithReplyCounts = fetchedComments.map((comment, index) => ({
          ...comment,
          replyCount: replyCounts[index]
        }))
        setComments(commentsWithReplyCounts)
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
        setHasMore(querySnapshot.docs.length === 10)
        setLoading(false)
      })
    }, (err) => {
      console.error('Error fetching comments:', err)
      setError(err.message)
      setLoading(false)
    })

    return unsubscribe
  }, [confessionId, sortBy])

  const fetchReplyCount = async (commentId) => {
    const replyQuery = query(
      collection(db, 'confessions', confessionId, 'comments'),
      where('replyTo', '==', commentId)
    )
    const replySnapshot = await getDocs(replyQuery)
    return replySnapshot.size
  }

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    const unsubscribeComments = fetchComments()

    return () => {
      unsubscribeAuth()
      unsubscribeComments()
    }
  }, [auth, fetchComments])

  const handleDelete = async (commentId) => {
    try {
      await deleteDoc(doc(db, 'confessions', confessionId, 'comments', commentId))
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handleEdit = (commentId, content) => {
    setEditingCommentId(commentId)
    setEditContent(content)
  }

  const handleEditSubmit = async () => {
    try {
      const commentRef = doc(db, 'confessions', confessionId, 'comments', editingCommentId)
      await updateDoc(commentRef, { content: editContent })
      setEditingCommentId(null)
    } catch (error) {
      console.error('Error editing comment:', error)
    }
  }

  const handleReply = async () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    if (replyContent.trim() === '') return

    try {
      const replyRef = doc(collection(db, 'confessions', confessionId, 'comments'))
      const replyData = {
        content: replyContent,
        userId: user.uid,
        userEmail: user.email,
        avatar: user.photoURL || '/default-avatar.png',
        nickname: user.displayName || 'Anonymous',
        date: new Date(),
        replyTo: replyTo,
        likes: 0,
      }
      await setDoc(replyRef, replyData)
      setReplyContent('')
      setReplyTo(null)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
      setRepliesVisible(prev => ({ ...prev, [replyTo]: true }))
    } catch (error) {
      console.error('Error posting reply:', error)
    }
  }

  const toggleReplies = async (commentId) => {
    setRepliesVisible(prev => ({ ...prev, [commentId]: !prev[commentId] }))
    if (!repliesVisible[commentId]) {
      const repliesQuery = query(
        collection(db, 'confessions', confessionId, 'comments'),
        where('replyTo', '==', commentId),
        orderBy('date', 'desc')
      )
      const repliesSnapshot = await getDocs(repliesQuery)
      const fetchedReplies = repliesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date instanceof Timestamp ? doc.data().date.toDate() : new Date(doc.data().date)
      }))
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId ? { ...comment, replies: fetchedReplies } : comment
        )
      )
    }
  }

  const loadMoreComments = () => {
    if (!confessionId || !lastVisible) return

    const q = query(
      collection(db, 'confessions', confessionId, 'comments'),
      where('replyTo', '==', null),
      orderBy(sortBy === 'latest' ? 'date' : 'likes', 'desc'),
      startAfter(lastVisible),
      limit(10)
    )

    onSnapshot(q, (querySnapshot) => {
      const fetchedComments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date instanceof Timestamp ? doc.data().date.toDate() : new Date(doc.data().date)
      }))

      // Fetch reply counts for each comment
      const replyPromises = fetchedComments.map(comment =>
        fetchReplyCount(comment.id)
      )

      Promise.all(replyPromises).then(replyCounts => {
        const commentsWithReplyCounts = fetchedComments.map((comment, index) => ({
          ...comment,
          replyCount: replyCounts[index]
        }))
        setComments(prevComments => [...prevComments, ...commentsWithReplyCounts])
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
        setHasMore(querySnapshot.docs.length === 10)
      })
    })
  }

  if (loading && comments.length === 0) return <p className="text-gray-400">Loading comments...</p>
  if (error) return <p className="text-red-500">Error: {error}</p>

  return (
    <>
    {comments.length > 0 ? (
      <div className="space-y-4 bg-[#2a2a2a] text-gray-100 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Comments</h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="relevant">Most Relevant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showSuccessMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Comment posted successfully!</span>
          </div>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="mb-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.avatar || '/default-avatar.png'} alt={comment.nickname} />
                <AvatarFallback>{comment.nickname.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm">{comment.nickname}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      <TimeAgo timestamp={comment.date} />
                    </span>
                  </div>
                  {user && user.uid === comment.userId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-dark-background hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-dark-background text-gray-100">
                        <DropdownMenuItem onClick={() => handleEdit(comment.id, comment.content)} className="hover:bg-gray-700">
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setCommentToDelete(comment.id)
                          setIsModalOpen(true)
                        }} className="hover:bg-gray-700">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {editingCommentId === comment.id ? (
                  <div className="mt-2">
                    <ReactQuill
                      value={editContent}
                      onChange={setEditContent}
                      modules={modules}
                      theme="bubble"
                      className="bg-gray-800 text-gray-100 rounded"
                    />
                    <div className="flex justify-end mt-2 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingCommentId(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleEditSubmit}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 text-sm prose prose-invert max-w-none">
                    {parse(comment.content)}
                  </div>
                )}
                <div className="flex items-center space-x-4 mt-2 text-xs">
                  <LikeButton itemId={comment.id} itemType={`confessions/${confessionId}/comments`} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-gray-400 hover:text-gray-100 hover:bg-dark-background"
                    onClick={() => {
                      if (!user) {
                        setIsAuthModalOpen(true)
                      } else {
                        setReplyTo(comment.id)
                      }
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>Reply</span>
                  </Button>
                  {comment.replyCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReplies(comment.id)}
                      className="h-6 px-2 text-gray-400 hover:text-gray-100 hover:bg-dark-background	"
                    >
                      {repliesVisible[comment.id] ? 'Hide Replies' : `Show Replies (${comment.replyCount})`}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {replyTo === comment.id && (
              <div className="mt-4 ml-11">
                <ReactQuill
                  value={replyContent}
                  onChange={setReplyContent}
                  modules={modules}
                  theme="bubble"
                  placeholder="Write a reply..."
                  className="bg-gray-800 text-gray-100 rounded"
                />
                <div className="flex justify-end items-center mt-2">
                  <Button onClick={handleReply} size="sm" className="text-white hover:text-blue-300">
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </div>
            )}
            {repliesVisible[comment.id] && comment.replies && (
              <div className="mt-4 space-y-4 ml-8">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="pl-4 border-l border-gray-700">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={reply.avatar || '/default-avatar.png'} alt={reply.nickname} />
                        <AvatarFallback>{reply.nickname.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-sm">{reply.nickname}</span>
                            <span className="text-xs text-gray-400 ml-2">
                              <TimeAgo timestamp={reply.date} />
                            </span>
                          </div>
                          {user && user.uid === reply.userId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-dark-background hover:text-white">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-dark-background text-gray-100">
                                <DropdownMenuItem onClick={() => handleEdit(reply.id, reply.content)} className="hover:bg-gray-700">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setCommentToDelete(reply.id)
                                  setIsModalOpen(true)
                                }} className="hover:bg-gray-700">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        {editingCommentId === reply.id ? (
                          <div className="mt-2">
                            <ReactQuill
                              value={editContent}
                              onChange={setEditContent}
                              modules={modules}
                              theme="bubble"
                              className="bg-gray-800 text-gray-100 rounded"
                            />
                            <div className="flex justify-end mt-2 space-x-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingCommentId(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={handleEditSubmit}>
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 text-sm prose prose-invert max-w-none">
                            {parse(reply.content)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Separator className="my-4 bg-gray-700" />
          </div>
        ))}

        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button onClick={loadMoreComments} variant="outline">
              Load More Comments
            </Button>
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="bg-dark-background">
          <div className=" text-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Delete Comment</h3>
            <p>Are you sure you want to delete this comment?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline" className="bg-dark-background"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(commentToDelete)}
                variant="destructive"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
          <div className="bg-gray-800 text-gray-100 p-6 rounded-lg">
            <AuthForm mode={authMode} setMode={setAuthMode} onAuthSuccess={() => setIsAuthModalOpen(false)} />
          </div>
        </Modal>
      </div>
 ) : (
  <p className="text-gray-400">No comments yet.</p>
)}
 </>
  )
}