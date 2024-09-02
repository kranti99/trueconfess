'use client';
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "/firebase";
import { FaCheckCircle } from "react-icons/fa";
import "react-quill/dist/quill.snow.css";
import "quill-emoji/dist/quill-emoji.css";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Switch from "react-switch"; // import a switch component

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const darkModeSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#333",
    borderColor: "#555",
    color: "#fff",
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? "#555" : isFocused ? "#444" : "#333",
    color: "#fff",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
};

const ConfessionForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [location, setLocation] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAge, setShowAge] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showGender, setShowGender] = useState(true);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, [auth]);
  useEffect(() => {
    let Quill;
    let EmojiBlot;
    let ShortNameEmoji;
    let ToolbarEmoji;

    if (typeof window !== 'undefined') {
      Quill = require('react-quill').Quill;
      EmojiBlot = require('quill-emoji').EmojiBlot;
      ShortNameEmoji = require('quill-emoji').ShortNameEmoji;
      ToolbarEmoji = require('quill-emoji').ToolbarEmoji;

      if (Quill) {
        Quill.register("modules/emoji", {
          EmojiBlot,
          ShortNameEmoji,
          ToolbarEmoji,
        });
      }
    }
  }, []);
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const tagsSnapshot = await getDocs(collection(db, "tags"));
        const fetchedCategories = categoriesSnapshot.docs.map((doc) => ({
          value: doc.id,
          label: doc.data().name,
        }));
        const fetchedTags = tagsSnapshot.docs.map((doc) => ({
          value: doc.id,
          label: doc.data().name,
        }));
        setCategories(fetchedCategories);
        setTags(fetchedTags);
      } catch (error) {
        console.error("Error fetching categories and tags: ", error);
      }
    };

    fetchCategoriesAndTags();
  }, []);

  const handlePostConfession = async (event) => {
    event.preventDefault();
    if (!authUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      setIsPosting(true);
      await addDoc(collection(db, "confessions"), {
        title: title.trim(),
        content,
        categories: selectedCategories.map((cat) => cat.value),
        tags: selectedTags.map((tag) => tag.value),
        date: serverTimestamp(),
        userId: authUser.uid,
        displayName: isAnonymous ? "Anonymous" : authUser.displayName || "Anonymous",
        likes: 0,
        commentCount: 0,
        location: showLocation ? location.trim() : "",
        gender: showGender ? gender : "",
        age: showAge ? parseInt(age, 10) : null,
      });
      setTitle("");
      setContent("");
      setSelectedCategories([]);
      setSelectedTags([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding confession: ", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!authUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      setIsSaving(true);
      const draftData = {
        title: title.trim(),
        content,
        categories: selectedCategories.map((cat) => cat.value),
        tags: selectedTags.map((tag) => tag.value),
        date: serverTimestamp(),
        userId: authUser.uid,
        displayName: isAnonymous ? "Anonymous" : authUser.displayName || "Anonymous",
        isDraft: true,
        location: showLocation ? location.trim() : "",
        gender: showGender ? gender : "",
        age: showAge ? parseInt(age, 10) : null,
      };
      localStorage.setItem("draft", JSON.stringify(draftData));
      await addDoc(collection(db, "drafts"), draftData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving draft: ", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const draft = localStorage.getItem("draft");
    if (draft) {
      const savedDraft = JSON.parse(draft);
      setTitle(savedDraft.title);
      setContent(savedDraft.content);
      setSelectedCategories(categories.filter((cat) => savedDraft.categories.includes(cat.value)));
      setSelectedTags(savedDraft.tags.map((tag) => ({ value: tag, label: tag })));
    }
  }, [categories]);

  useEffect(() => {
    const beforeUnloadHandler = (event) => {
      if (title || content) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, [title, content]);

  const handleCreateTag = async (inputValue) => {
    if (!/^[a-zA-Z0-9]+$/.test(inputValue)) {
      alert("Tags should only contain alphanumeric characters without spaces or special characters.");
      return;
    }
    const newTag = { name: inputValue };
    const tagRef = doc(db, "tags", inputValue);
    await setDoc(tagRef, newTag);
    const newOption = { value: inputValue, label: inputValue };
    setSelectedTags((prev) => [...prev, newOption]);
    setTags((prev) => [...prev, newOption]);
  };

  const quillModules = {
    toolbar: [
      [{ list: "ordered" }, { list: "bullet" }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ align: [] }],
      ["emoji"],
      ["clean"],
    ],
    "emoji-toolbar": true,
    "emoji-textarea": true,
    "emoji-shortname": true,
  };

  return (
    <div className="p-6 bg-dark-background-light rounded-lg text-white shadow-md max-w-3xl mx-auto">
      {showSuccess && (
        <div className="bg-green-500 text-white p-4 rounded-md mb-6 flex items-center">
          <FaCheckCircle className="mr-2" /> Confession saved successfully!
        </div>
      )}

      <form onSubmit={handlePostConfession}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-600"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="categories" className="block text-sm font-bold mb-2">
            Categories
          </label>
          <Select
            id="categories"
            options={categories}
            isMulti
            value={selectedCategories}
            onChange={setSelectedCategories}
            styles={darkModeSelectStyles}
            placeholder="Select categories..."
          />
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-bold mb-2">
            Tags
          </label>
          <CreatableSelect
            id="tags"
            options={tags}
            isMulti
            value={selectedTags}
            onChange={setSelectedTags}
            onCreateOption={handleCreateTag}
            styles={darkModeSelectStyles}
            placeholder="Select or create tags..."
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-bold mb-2">
            Content
          </label>
          <ReactQuill
            id="content"
            value={content}
            onChange={setContent}
            modules={quillModules}
            className="bg-gray-700 text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Post as Anonymous</label>
          <Switch
            onChange={() => setIsAnonymous(!isAnonymous)}
            checked={isAnonymous}
            className="react-switch"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Age</label>
          <div className="flex items-center">
            <input
              type="number"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-600"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={!showAge}
              placeholder="Enter your age"
            />
            <Switch
              onChange={() => setShowAge(!showAge)}
              checked={showAge}
              className="react-switch ml-3"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Location</label>
          <div className="flex items-center">
            <input
              type="text"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-600"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={!showLocation}
              placeholder="Enter your location"
            />
            <Switch
              onChange={() => setShowLocation(!showLocation)}
              checked={showLocation}
              className="react-switch ml-3"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Gender</label>
          <div className="flex items-center">
            <Select
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
              value={{ value: gender, label: gender }}
              onChange={(option) => setGender(option.value)}
              isDisabled={!showGender}
              styles={darkModeSelectStyles}
              placeholder="Select your gender"
            />
            <Switch
              onChange={() => setShowGender(!showGender)}
              checked={showGender}
              className="react-switch ml-3"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isPosting}
          >
            {isPosting ? "Posting..." : "Post Confession"}
          </button>
        </div>
      </form>

      {showAuthModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
            <p className="mb-4">Please log in to post your confession.</p>
            <button
              onClick={() => setShowAuthModal(false)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfessionForm;
