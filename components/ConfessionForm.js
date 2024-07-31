"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { getAuth } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "/firebase";
import { FaCheckCircle } from "react-icons/fa";
import AuthForm from "@components/AuthForm";

// Import ReactQuill dynamically
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.bubble.css";

// Import quill-emoji
import "quill-emoji/dist/quill-emoji.css";

export default function ConfessionForm() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowModal(true);
      return;
    }
    try {
      await addDoc(collection(db, "confessions"), {
        title,
        content,
        isAnonymous,
        author: isAnonymous ? "Anonymous" : user.displayName || "Anonymous",
        timestamp: serverTimestamp(),
      });
      setShowSuccessMessage(true);
      setTitle("");
      setContent("");
      setIsAnonymous(false);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error adding confession: ", error);
    }
  };

  const saveDraft = async () => {
    if (!user) {
      setShowModal(true);
      return;
    }
    try {
      await addDoc(collection(db, "drafts"), {
        title,
        content,
        isAnonymous,
        author: isAnonymous ? "Anonymous" : user.displayName || "Anonymous",
        timestamp: serverTimestamp(),
      });
      setTitle("");
      setContent("");
      setIsAnonymous(false);
    } catch (error) {
      console.error("Error saving draft: ", error);
    }
  };

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["emoji"],
      ["clean"],
    ],
  };

  return (
    <div>
      {showSuccessMessage && (
        <div className="text-green-600">
          <FaCheckCircle /> Confession submitted successfully!
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-700"
            >
              &times;
            </button>
            <AuthForm />
          </div>
        </div>
      )}
      <button onClick={() => setShowForm(!showForm)} className="my-4">
        {showForm ? "Cancel" : "Add Confession"}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="my-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-b w-full mb-4 p-2"
          />
          <ReactQuill
            value={content}
            onChange={setContent}
            theme="bubble"
            modules={modules}
            className="mb-4"
          />
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="mr-2"
            />
            Submit anonymously
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={saveDraft}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
              Save draft
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
