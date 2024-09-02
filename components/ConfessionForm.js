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
import Switch from "react-switch";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const darkModeSelectStyles = {
    control: (base) => ({ ...base, backgroundColor: "#333", borderColor: "#555", color: "#fff", }),
    option: (base, { isFocused, isSelected }) => ({ ...base, backgroundColor: isSelected ? "#555" : isFocused ? "#444" : "#333", color: "#fff", }),
    singleValue: (base) => ({ ...base, color: "#fff", }),
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
        let Quill, EmojiBlot, ShortNameEmoji, ToolbarEmoji;
        if (typeof window !== 'undefined') {
            Quill = require('react-quill').Quill;
            EmojiBlot = require('quill-emoji').EmojiBlot;
            ShortNameEmoji = require('quill-emoji').ShortNameEmoji;
            ToolbarEmoji = require('quill-emoji').ToolbarEmoji;

            if (Quill) {
                Quill.register("modules/emoji", { EmojiBlot, ShortNameEmoji, ToolbarEmoji });
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

        if (selectedCategories.length > 5 || selectedTags.length > 5) {
            alert("You can select up to 5 categories and 5 tags only.");
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

        if (selectedCategories.length > 5 || selectedTags.length > 5) {
            alert("You can select up to 5 categories and 5 tags only.");
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
        if (inputValue.length > 20) {
            alert("Tag name should not exceed 20 characters.");
            return;
        }

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
                    <FaCheckCircle className="mr-2" />
                    Confession saved successfully!
                </div>
            )}
            <form onSubmit={handlePostConfession}>
                <div className="mb-6">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white focus:outline-none focus:bg-gray-600"
                    required
                    maxLength={100}
                    placeholder="Title"
                />
                </div>
                <div className="mb-16">
                    <label className="block text-sm font-medium mb-2">Write your confession here...</label>
                    
                    <ReactQuill
                        value={content}
                        onChange={setContent}
                        className="bg-dark-background-dark text-white"
                        modules={quillModules}
                        style={{ height: "100px" }} // Increased height for content area
                        placeholder="Write your confession here..."
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Categories</label>
                    <Select
                        isMulti
                        value={selectedCategories}
                        onChange={(selectedOptions) => setSelectedCategories(selectedOptions)}
                        options={categories}
                        styles={darkModeSelectStyles}
                        className="bg-dark-background-dark"
                        maxMenuHeight={150}
                        isSearchable
                        closeMenuOnSelect={false}
                    />
                    {selectedCategories.length > 5 && (
                        <p className="text-red-500 text-sm mt-2">You can select up to 5 categories only.</p>
                    )}
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <CreatableSelect
                        isMulti
                        value={selectedTags}
                        onChange={(selectedOptions) => setSelectedTags(selectedOptions)}
                        onCreateOption={handleCreateTag}
                        options={tags}
                        styles={darkModeSelectStyles}
                        className="bg-dark-background-dark"
                        maxMenuHeight={150}
                        isSearchable
                        closeMenuOnSelect={false}
                    />
                    {selectedTags.length > 5 && (
                        <p className="text-red-500 text-sm mt-2">You can select up to 5 tags only.</p>
                    )}
                </div>
                <div className="mb-6 flex items-center">
                    <label className="block text-sm font-medium mb-2 mr-4">Post as Anonymous</label>
                    <Switch
                        onChange={() => setIsAnonymous(!isAnonymous)}
                        checked={isAnonymous}
                        onColor="#4ade80"
                        offColor="#f87171"
                    />
                </div>
                <div className="flex">
                <div className="mb-6 flex items-center">
                    <label className="block text-sm font-medium mb-2 mr-4">Show Age</label>
                    <Switch
                        onChange={() => setShowAge(!showAge)}
                        checked={showAge}
                        onColor="#4ade80"
                        offColor="#f87171"
                    />
                </div>
                {showAge && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Age</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full p-2 rounded-md border border-gray-600 bg-dark-background-dark text-white"
                            maxLength={3}
                        />
                    </div>
                )}
                <div className="mb-6 flex items-center">
                    <label className="block text-sm font-medium mb-2 mr-4">Show Location</label>
                    <Switch
                        onChange={() => setShowLocation(!showLocation)}
                        checked={showLocation}
                        onColor="#4ade80"
                        offColor="#f87171"
                    />
                </div>
                {showLocation && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full p-2 rounded-md border border-gray-600 bg-dark-background-dark text-white"
                            maxLength={50}
                        />
                    </div>
                )}
                <div className="mb-6 flex items-center">
                    <label className="block text-sm font-medium mb-2 mr-4">Show Gender</label>
                    <Switch
                        onChange={() => setShowGender(!showGender)}
                        checked={showGender}
                        onColor="#4ade80"
                        offColor="#f87171"
                    />
                </div>
                {showGender && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Gender</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full p-2 rounded-md border border-gray-600 bg-dark-background-dark text-white"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                )}
                </div>
                <div className="flex justify-between items-center">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        disabled={isPosting}
                    >
                        Post Confession
                    </button>
                    <button
                        type="button"
                        className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-300"
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                    >
                        Save Draft
                    </button>
                </div>
            </form>
            {showAuthModal && <p className="text-red-500">Please sign in to post a confession or save a draft.</p>}
        </div>
    );
};

export default ConfessionForm;
