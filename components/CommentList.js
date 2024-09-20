import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { collection, query, onSnapshot, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import TimeAgo from './TimeAgo';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Heart, MessageCircle, MoreVertical, Edit, Trash2, Send, CheckCircle } from 'lucide-react'
import parse from 'html-react-parser';
import Modal from '@components/modal';
import AuthForm from './AuthForm';
import LikeButton from './LikeButton';

import 'react-quill/dist/quill.bubble.css';
import 'quill-emoji/dist/quill-emoji.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
};

export default function CommentList({ confessionId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [repliesVisible, setRepliesVisible] = useState({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!confessionId) return;

    const q = query(collection(db, 'confessions', confessionId, 'comments'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedComments = [];
        querySnapshot.forEach((doc) => {
          const commentData = doc.data();
          fetchedComments.push({ id: doc.id, ...commentData });
        });
        setComments(fetchedComments);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching comments:', err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [confessionId]);

  const handleDelete = async (commentId) => {
    try {
      await deleteDoc(doc(db, 'confessions', confessionId, 'comments', commentId));
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEdit = (commentId) => {
    setEditingCommentId(commentId);
    const commentToEdit = comments.find((comment) => comment.id === commentId);
    setEditContent(commentToEdit.content);
  };

  const handleEditSubmit = async () => {
    try {
      const commentRef = doc(db, 'confessions', confessionId, 'comments', editingCommentId);
      await updateDoc(commentRef, { content: editContent });
      setEditingCommentId(null);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleReply = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (replyContent.trim() === '') return;

    try {
      const replyRef = doc(collection(db, 'confessions', confessionId, 'comments'));
      const replyData = {
        content: replyContent,
        userId: isAnonymous ? 'anonymous' : user.uid,
        userEmail: isAnonymous ? 'anonymous' : user.email,
        avatar: isAnonymous ? '/default-avatar.png' : user.photoURL,
        nickname: isAnonymous ? 'Anonymous' : user.displayName,
        date: new Date(),
        parentId: replyTo,
        likes: 0,
      };
      await setDoc(replyRef, replyData);
      setReplyContent('');
      setReplyTo(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const toggleReplies = (commentId) => {
    setRepliesVisible((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  if (loading) return <p className="text-gray-400">Loading comments...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-4 bg-gray-900 text-gray-100 p-4 rounded-lg">
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>Comment posted successfully!</span>
        </div>
      )}

      {comments.map((comment) => (
        <div key={comment.id} className={`${comment.parentId ? 'ml-4 pl-4 border-l border-gray-700' : ''}`}>
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.avatar || '/default-avatar.png'} alt={comment.nickname} />
              
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
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-800 text-gray-100">
                      <DropdownMenuItem onClick={() => handleEdit(comment.id)} className="hover:bg-gray-700">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setCommentToDelete(comment.id);
                        setIsModalOpen(true);
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
                  className="h-6 px-2 text-gray-400 hover:text-gray-100"
                  onClick={() => {
                    if (!user) {
                      setIsAuthModalOpen(true);
                    } else {
                      setReplyTo(comment.id);
                    }
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span>Reply</span>
                </Button>
                {comment.parentId === null && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplies(comment.id)}
                    className="h-6 px-2 text-gray-400 hover:text-gray-100"
                  >
                    {repliesVisible[comment.id] ? 'Hide Replies' : 'Show Replies'}
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
              <div className="flex justify-between items-center mt-2">
                <Button onClick={handleReply} size="sm" className="text-blue-400 hover:text-blue-300">
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`anonymous-${comment.id}`}
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked)}
                  />
                  <Label htmlFor={`anonymous-${comment.id}`} className="text-sm text-gray-400">Post as Anonymous</Label>
                </div>
              </div>
            </div>
          )}
          {repliesVisible[comment.id] && (
            <div className="mt-4 space-y-4">
              {comments
                .filter((reply) => reply.parentId === comment.id)
                .map((reply) => (
                  <div key={reply.id} className="ml-8 pl-4 border-l border-gray-700">
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
                        </div>
                        <div className="mt-1 text-sm prose prose-invert max-w-none">
                          {parse(reply.content)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
          <Separator className="my-4 bg-gray-700" />
        </div>
      ))}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-gray-800 text-gray-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Delete Comment</h3>
          <p>Are you sure you want to delete this comment?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="outline"
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
        <div className="bg-gray-800 text-gray-100 p-6 rounde d-lg">
          <AuthForm mode={authMode} setMode={setAuthMode} onAuthSuccess={() => setIsAuthModalOpen(false)} />
        </div>
      </Modal>
    </div>
  );
}