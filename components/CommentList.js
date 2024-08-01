import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { collection, query, onSnapshot, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '/firebase';
import { getAuth } from 'firebase/auth';
import TimeAgo from './TimeAgo';
import Avatar from 'react-avatar';
import Modal from '@components/modal';
import EditDropDown from './EditDropDown';
import parse from 'html-react-parser';
import LikeButton from './LikeButton';

import 'react-quill/dist/quill.bubble.css';
import 'quill-emoji/dist/quill-emoji.css';
import { Quill } from 'react-quill';
import { EmojiBlot, ShortNameEmoji, ToolbarEmoji } from 'quill-emoji';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const modules = {
  toolbar: [
    [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'color': [] }, { 'background': [] }],
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
  const [commenter, setCommenter] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

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

  const handleDelete = async () => {
    if (commentToDelete) {
      try {
        await deleteDoc(doc(db, 'confessions', confessionId, 'comments', commentToDelete));
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleReply = async () => {
    if (replyContent.trim() === '') return;

    try {
      const replyRef = doc(collection(db, 'confessions', confessionId, 'comments'));
      const replyData = {
        content: replyContent,
        userId: user.uid,
        userEmail: user.email,
        avatar: user.photoURL,
        nickname: user.displayName,
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

  if (loading) return <p>Loading comments...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="space-y-4">
      {showSuccessMessage && (
        <div className="fixed bottom-0 right-0 m-4 p-4 bg-green-500 text-white rounded shadow-lg">
          <FaCheckCircle className="inline mr-2" />
          Comment posted successfully!
        </div>
      )}

      {comments.map((comment) => (
        <div key={comment.id} className="p-4 bg-gray-800 rounded shadow-lg">
          <div className="flex items-start space-x-4 mb-4">
            <Avatar
              name={comment.nickname}
              src={comment.avatar || '/default-avatar.png'}
              size="40"
              round={true}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <p className="font-bold text-base">{comment.nickname}</p>
                <TimeAgo timestamp={comment.date} />
              </div>
              <div className="text-gray-300">{parse(comment.content)}</div>
            </div>
            {user && user.uid === comment.userId && (
              <EditDropDown
                commentId={comment.id}
                confessionId={confessionId}
                setCommentToDelete={setCommentToDelete}
                setIsModalOpen={setIsModalOpen}
                setCommenter={setCommenter}
                commenter={comment.nickname}
              />
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <LikeButton itemId={comment.id} itemType={`confessions/${confessionId}/comments`} />
            <button
              className="flex items-center space-x-1 text-gray-400 hover:text-white"
              onClick={() => setReplyTo(comment.id)}
            >
              <FaReply />
              <span>Reply</span>
            </button>
          </div>
          {replyTo === comment.id && (
            <div className="mt-4">
              <ReactQuill
                value={replyContent}
                onChange={setReplyContent}
                modules={modules}
                placeholder="Write your reply here..."
                theme="bubble"
                className="bg-gray-900 text-white rounded shadow-lg"
              />
              <div className="flex justify-end mt-2">
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded mr-2"
                  onClick={() => setReplyTo(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleReply}
                >
                  Post Reply
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete this comment by ${commenter}?`}
      />
    </div>
  );
}
