'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { collection, query, onSnapshot, deleteDoc, doc, updateDoc, increment, getDoc, setDoc, deleteField } from 'firebase/firestore';
import { db } from '/firebase';
import { getAuth } from 'firebase/auth';
import { FaThumbsUp, FaReply, FaCheckCircle } from 'react-icons/fa';
import TimeAgo from './TimeAgo';
import Avatar from 'react-avatar';
import Modal from '@components/modal';
import EditDropDown from './EditDropDown';

import 'react-quill/dist/quill.bubble.css';
import 'quill-emoji/dist/quill-emoji.css';
import { Quill } from 'react-quill';
import { EmojiBlot, ShortNameEmoji, ToolbarEmoji } from 'quill-emoji';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const modules = {
  toolbar: [
    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
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
  const [userLikes, setUserLikes] = useState({});
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

  const openDeleteModal = (commentId, commenterName) => {
    setCommentToDelete(commentId);
    setCommenter(commenterName);
    setIsModalOpen(true);
  };

  const handleReply = (commentId) => {
    setReplyTo(commentId);
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    try {
      const newCommentRef = doc(collection(db, 'confessions', confessionId, 'comments'));
      const newComment = {
        content: replyContent,
        date: new Date().toISOString(),
        userId: user.uid,
        avatar: user.photoURL,
        nickname: user.displayName,
        replyTo,
        likes: 0,
      };
      await setDoc(newCommentRef, newComment);
      setReplyContent('');
      setReplyTo(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleLike = async (commentId) => {
    if (!userLikes[commentId]) {
      try {
        const commentRef = doc(db, 'confessions', confessionId, 'comments', commentId);
        await updateDoc(commentRef, {
          likes: increment(1),
        });
        const userLikesRef = doc(db, 'users', user.uid);
        await updateDoc(userLikesRef, {
          [`likes.${commentId}`]: true,
        });
        setUserLikes((prevLikes) => ({ ...prevLikes, [commentId]: true }));
      } catch (error) {
        console.error('Error liking comment:', error);
      }
    } else {
      try {
        const commentRef = doc(db, 'confessions', confessionId, 'comments', commentId);
        await updateDoc(commentRef, {
          likes: increment(-1),
        });
        const userLikesRef = doc(db, 'users', user.uid);
        await updateDoc(userLikesRef, {
          [`likes.${commentId}`]: deleteField(),
        });
        setUserLikes((prevLikes) => {
          const updatedLikes = { ...prevLikes };
          delete updatedLikes[commentId];
          return updatedLikes;
        });
      } catch (error) {
        console.error('Error unliking comment:', error);
      }
    }
  };

  if (loading) return <p>Loading comments...</p>;
  if (error) return <p>Error: {error}</p>;

  const renderComments = (comments, parentId = null) => {
    const filteredComments = comments.filter(comment => (comment.replyTo ?? null) === parentId);

    return filteredComments.map((comment) => (
      <div key={comment.id} className="p-4 bg-gray-900 text-white rounded-lg shadow-md mb-4">
        <div className="flex items-start space-x-4">
          <Avatar src={comment.avatar} size="40" round={true} name={comment.nickname} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold">{comment.nickname}</span>
                <span className="ml-2 text-gray-400 text-sm"><TimeAgo timestamp={comment.date} /></span>
              </div>
              {user && comment.userId === user.uid && (
                <EditDropDown
                  onEdit={() => handleReply(comment.id)}
                  onDelete={() => openDeleteModal(comment.id, comment.nickname)}
                  itemId={comment.id}
                />
              )}
            </div>
            <div className="mt-2 text-gray-300" dangerouslySetInnerHTML={{ __html: comment.content }}></div>
            <div className="mt-2 flex items-center space-x-4">
              <button
                className={`flex items-center space-x-1 ${userLikes[comment.id] ? 'text-blue-500' : 'text-gray-400'} hover:text-white`}
                onClick={() => handleLike(comment.id)}
              >
                <FaThumbsUp />
                <span>{comment.likes}</span>
              </button>
              <button
                className="flex items-center space-x-1 text-gray-400 hover:text-white"
                onClick={() => handleReply(comment.id)}
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
                  theme="bubble"
                  placeholder="Write a reply..."
                  className="text-white placeholder-white"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                    onClick={() => {
                      setReplyContent('');
                      setReplyTo(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={handleReplySubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {renderComments(comments, comment.id)}
      </div>
    ));
  };

  return (
    <div>
      {renderComments(comments)}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div>
          <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
          <p>Are you sure you want to delete this comment from <strong>{commenter}</strong>?</p>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded flex items-center">
          <FaCheckCircle className="mr-2" />
          <span>Comment posted successfully!</span>
        </div>
      )}
    </div>
  );
}
