'use client';

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "/firebase";
import { CheckCircle, AlertCircle, Send, Save, Eye, EyeOff } from 'lucide-react';
import "react-quill/dist/quill.snow.css";
import "quill-emoji/dist/quill-emoji.css";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const selectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#2a2a2a",
    borderColor: "hsl(var(--border))",
    "&:hover": { borderColor: "hsl(var(--border-hover))" },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#2a2a2a",
    border: "1px solid hsl(var(--border))",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "hsl(var(--accent))" : "transparent",
    color: state.isFocused ? "hsl(var(--accent-foreground))" : "hsl(var(--foreground))",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "hsl(var(--accent))",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "hsl(var(--accent-foreground))",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "hsl(var(--accent-foreground))",
    "&:hover": { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" },
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
  const [showAge, setShowAge] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showGender, setShowGender] = useState(false);

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
      // Check if title or content are empty
    if (title.trim() === "" || content.trim() === "") {
      alert("Title and content are required to post a confession.");
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
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean'],
      ['emoji'],
    ],
    "emoji-toolbar": false,
    "emoji-textarea": true,
    "emoji-shortname": true,
  };

  return (
    <div className="min-h-screen p-4">
      <Card className="w-full max-w-4xl mx-auto bg-[#2a2a2a] text-white border-none">
        <CardContent className="pt-6">
          {showSuccess && (
            <div className="bg-green-500 text-white p-4 rounded-md mb-6 flex items-center">
              <CheckCircle className="mr-2" />
              Confession saved successfully!
            </div>
          )}/45
          <form onSubmit={handlePostConfession} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                placeholder="Enter your confession title"
                className="bg-[#2a2a2a] text-white border-[#5c5c5c]"
              />
            </div>
            <div>
              <Label htmlFor="content">Your Confession</Label>
              <ReactQuill
                id="content"
                value={content}
                onChange={setContent}
                modules={quillModules}
                className="bg-[#2a2a2a] text-white mb-4 border-[#5c5c5c]"
                placeholder="Write your confession here..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="categories">Categories</Label>
                <Select
                  id="categories"
                  isMulti
                  value={selectedCategories}
                  onChange={(selectedOptions) => setSelectedCategories(selectedOptions)}
                  options={categories}
                  styles={selectStyles}
                  className="react-select-container border-[#5c5c5c]"
                  classNamePrefix="react-select"
                  placeholder="Select categories"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <CreatableSelect
                  id="tags"
                  isMulti
                  value={selectedTags}
                  onChange={(selectedOptions) => setSelectedTags(selectedOptions)}
                  onCreateOption={handleCreateTag}
                  options={tags}
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Add tags"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={() => setIsAnonymous(!isAnonymous)}
                  className="data-[state=checked]:bg-[#494949] data-[state=unchecked]:bg-[#181818]"
                />
                <Label htmlFor="anonymous">Post as Anonymous</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showAge"
                  checked={showAge}
                  onCheckedChange={() => setShowAge(!showAge)}
                  className="data-[state=checked]:bg-[#494949] data-[state=unchecked]:bg-[#181818]"
                />
                <Label htmlFor="showAge">{showAge ? "Hide Age" : "Show Age"}</Label>
              </div>
              
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="showGender"
                  checked={showGender}
                  onCheckedChange={() => setShowGender(!showGender)}
                  className="data-[state=checked]:bg-[#494949] data-[state=unchecked]:bg-[#181818]"
                />

                <Label htmlFor="showGender">{showGender ? "Hide Gender" : "Show Gender"}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showLocation"
                  checked={showLocation}
                  onCheckedChange={() => setShowLocation(!showLocation)}
                  className="data-[state=checked]:bg-[#494949] data-[state=unchecked]:bg-[#181818]"
                />
                <Label htmlFor="showLocation">{showLocation ? "Hide Location" : "Show Location"}</Label>
              </div>
              
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {showAge && (
              <div >
                <Label htmlFor="age">Age</Label>
                <select
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2 rounded-md border bg-[#2a2a2a] text-white mb-0"
                >
                  <option value="">Select your age</option>
                  {/* Start the options from age 10 */}
                  {Array.from({ length: 91 }, (_, index) => (
                    <option key={index + 10} value={index + 10}>
                      {index + 10}
                    </option>
                  ))}
                </select>

              </div>
            
            )}
            
            {showGender && (
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 rounded-md border bg-[#2a2a2a] text-white mb-0"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
            </div>
            
            {showLocation && (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={50}
                  placeholder="Enter your location"
                  className="bg-[#2a2a2a] text-white mb-0"
                />
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleSaveDraft} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save your confession as a draft</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button type="submit" onClick={handlePostConfession} disabled={isPosting}>
            <Send className="w-4 h-4 mr-2" />
            Post Confession
          </Button>
        </CardFooter>
        {showAuthModal && (
          <div className="mt-4 p-4 bg-destructive text-destructive-foreground rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>Please sign in to post a confession or save a draft.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ConfessionForm;