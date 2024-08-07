import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { collection, query, onSnapshot, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import TimeAgo from './TimeAgo';
import Avatar from 'react-avatar';
import Modal from '@components/modal';
import EditDropDown from './EditDropDown';
import parse from 'html-react-parser';
import LikeButton from './LikeButton';
import AuthForm from './AuthForm';
import { FaCheckCircle, FaReply, FaPaperPlane } from 'react-icons/fa';

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
  const [commenter, setCommenter] = useState('');
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

  if (loading) return <p>Loading comments...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="space-y-4 dark-mode">
      {showSuccessMessage && (
        <div className="fixed bottom-0 right-0 m-4 p-4 bg-green-500 text-white rounded shadow-lg">
          <FaCheckCircle className="inline mr-2" />
          Comment posted successfully!
        </div>
      )}

      {comments.map((comment) => (
        <div key={comment.id} className={`comment-container ${comment.parentId ? 'ml-8' : ''}`}>
          <div className="flex items-start space-x-4 mb-4">
            <Avatar
              name={comment.nickname}
              src={comment.avatar || '/default-avatar.png'}
              size={comment.parentId ? "30" : "40"}
              round={true}
            />
            <div className="bg-dark-background-light w-fit px-2 py-1 pb-0 rounded-lg">
              <p className="font-bold text-base mb-0">{comment.nickname}</p>
              <div className="text-gray-300 comment-content">
                {editingCommentId === comment.id ? (
                  <ReactQuill
                    value={editContent}
                    onChange={setEditContent}
                    modules={modules}
                    theme="bubble"
                  />
                ) : (
                  parse(comment.content)
                )}
              </div>
              {editingCommentId === comment.id && (
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
            {user && user.uid === comment.userId && (
              <EditDropDown
                itemId={comment.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <TimeAgo timestamp={comment.date} />
            <LikeButton itemId={comment.id} itemType={`confessions/${confessionId}/comments`} />
            <button
              className="flex items-center space-x-1 text-gray-400 hover:text-white"
              onClick={() => {
                if (!user) {
                  setIsAuthModalOpen(true);
                } else {
                  setReplyTo(comment.id);
                }
              }}
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
              />
              <div className="flex justify-between mt-2">
                <button
                  onClick={handleReply}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FaPaperPlane size={24} />
                </button>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-400">Post as Anonymous</span>
                </label>
              </div>
            </div>
          )}
          {repliesVisible[comment.id] && (
            <div className="ml-8 mt-4">
              {comments
                .filter((reply) => reply.parentId === comment.id)
                .map((reply) => (
                  <div key={reply.id} className="flex items-start space-x-4 mb-4">
                    <Avatar
                      name={reply.nickname}
                      src={reply.avatar || '/default-avatar.png'}
                      size="30"
                      round={true}
                    />
                    <div className="bg-dark-background-light w-fit px-2 py-1 pb-0 rounded-lg min-w-32">
                      <p className="font-bold text-base mb-0">{reply.nickname}</p>
                      <div className="text-gray-300 comment-content">{parse(reply.content)}</div>
                    </div>
                    {user && user.uid === reply.userId && (
                      <EditDropDown
                        itemId={reply.id}
                        onEdit={() => handleEdit(reply.id)}
                        onDelete={() => {
                          setCommentToDelete(reply.id);
                          setIsModalOpen(true);
                        }}
                      />
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}

      {!user && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Login to comment
          </button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div>
          <p>Are you sure you want to delete this comment?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(commentToDelete)}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
        <AuthForm mode={authMode} setMode={setAuthMode} onAuthSuccess={() => setIsAuthModalOpen(false)} />
      </Modal>
    </div>
  );
}
