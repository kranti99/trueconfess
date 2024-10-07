'use client';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "/firebase";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaShareAlt } from "react-icons/fa";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Heart, MessageSquare, Eye, MapPin, User, Calendar } from "lucide-react";
import dynamic from "next/dynamic";
const TimeAgo = dynamic(() => import("@components/TimeAgo"), { ssr: false });
import parse from 'html-react-parser';
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@components/LoadingSpinner";
import Image from 'next/image';

const stripHtml = (content) => content.replace(/<\/?[^>]+(>|$)/g, "");
const getExcerpt = (content, wordLimit) => content.split(' ').slice(0, wordLimit).join(' ') + '...';

export default function ProfileAndConfessionPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [confessions, setConfessions] = useState([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [page, setPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const userDocSnap = await getDoc(doc(db, "users", id));
        if (userDocSnap.exists()) setUserData(userDocSnap.data());
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [id]);

  useEffect(() => {
    if (!userData) return;
    const fetchUserConfessions = async () => {
      try {
        const q = query(collection(db, "confessions"), where("userId", "==", userData.uid));
        const querySnapshot = await getDocs(q);
        const fetchedConfessions = [];
        let viewsCount = 0, likesCount = 0;

        querySnapshot.forEach((doc) => {
          const confessionData = doc.data();
          fetchedConfessions.push({ id: doc.id, ...confessionData });
          viewsCount += confessionData.views || 0;
          likesCount += confessionData.likes || 0;
        });
        setConfessions(fetchedConfessions);
        setTotalViews(viewsCount);
        setTotalLikes(likesCount);
      } catch (error) {
        console.error("Error fetching confessions:", error);
      }
    };
    fetchUserConfessions();
  }, [userData]);

  const handleFollow = async () => {
    if (!userData) return;
    setFollowing(true);
    try {
      await updateDoc(doc(db, "users", id), { followers: increment(1) });
      const updatedSnap = await getDoc(doc(db, "users", id));
      setUserData(updatedSnap.data());
    } catch (error) {
      console.error("Error updating follower count:", error);
    } finally {
      setFollowing(false);
    }
  };

  const handleEditProfile = () => {
    router.push(`/edit-profile/${id}`);
  };

  if (loading) return <LoadingSpinner />;
  if (!userData) return <p className="text-white">User not found.</p>;

  const startIdx = (page - 1) * postsPerPage;
  const paginatedConfessions = confessions.slice(startIdx, startIdx + postsPerPage);
  const totalPages = Math.ceil(confessions.length / postsPerPage);

  return (
    <div className="min-h-screen text-white p-4">
      <div className="flex items-center justify-between mb-4 relative max-w-md mx-auto">
        <Image src={userData.avatar || "/placeholder.svg"} alt="User Avatar" width={80} height={80} className="rounded-full object-cover" />
        <div style={{ width: '60%' }}>
          <h1 className="text-2xl font-bold mr-2">{userData.nickname || "User"}</h1>
          <button className="w-full py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition" onClick={handleEditProfile}>
            Edit Profile
          </button>
        </div>
        <button className="text-2xl text-gray-400 hover:text-white transition-colors">
          <BsThreeDotsVertical />
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-between my-6 max-w-md mx-auto">
        {["Followers", "Total Views", "Total Likes", "Number of Posts"].map((stat, idx) => (
          <div key={idx} className="text-center">
            <p className="text-2xl font-bold">{idx === 0 ? userData.followers || 0 : idx === 1 ? totalViews || 0 : idx === 2 ? totalLikes || 0 : confessions.length}</p>
            <p className="text-sm text-gray-400">{stat}</p>
          </div>
        ))}
      </div>

      {/* Confessions */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Confessions by {userData.nickname || "User"}:</h2>
        {paginatedConfessions.length === 0 ? (
          <p className="text-gray-300">No confessions available.</p>
        ) : (
          paginatedConfessions.map((confession) => (
            <Link key={confession.id} href={`/confession/${confession.id}`} className="block group no-underline mb-4">
              <Card className="rounded-none md:rounded-xl bg-[#2a2a2a] border-gray-700 transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:shadow-black/60 group-hover:bg-[#303030] h-full">
                <CardHeader className="pb-4">
                  <div className="text-xs text-gray-400 space-x-4 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <TimeAgo timestamp={confession.date} />
                    {confession.location && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {confession.location}
                      </span>
                    )}
                    {confession.gender && (
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {confession.gender}{confession.gender && confession.age && <span>,&nbsp;</span>} {confession.age}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-grow pb-0">
                  <h2 className="text-xl md:text-2xl font-bold mb-3 text-[#4a9eff] transition-colors duration-300 break-all">{confession.title}</h2>
                  <div className="mb-4 overflow-hidden text-gray-300 text-sm md:text-base break-all">
                    {parse(stripHtml(getExcerpt(confession.content, 60)))}
                  </div>
                  {(confession.categories?.length > 0 || confession.tags?.length > 0) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {confession.categories?.map((category, index) => (
                        <Link key={index} href={`/category/${category}`}><Badge variant="outline" className="bg-[#4a9eff] text-[#1c1c1c] hover:bg-[#2d80e1]">{category}</Badge></Link>
                      ))}
                      {confession.tags?.map((tag, index) => (
                        <Link key={index} href={`/tag/${tag}`}><Badge variant="outline" className="text-gray-300 bg-[#3a3a3a]">{tag}</Badge></Link>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-3 pb-3 border-t border-gray-700">
                  {[Heart, MessageSquare, Eye].map((Icon, idx) => (
                    <div key={idx} className="flex items-center space-x-2 group">
                      <Icon className={`w-5 h-5 ${idx === 0 ? "text-red-500" : idx === 1 ? "text-[#4a9eff]" : "text-[#45d754]"}`} />
                      <span>{idx === 0 ? confession.likes : idx === 1 ? confession.commentCount : confession.views}</span>
                    </div>
                  ))}
                </CardFooter>
              </Card>
            </Link>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <button
              className={`mx-2 px-4 py-2 rounded-full transition ${
                page === 1 ? "bg-gray-600 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                className={`mx-1 px-4 py-2 rounded-full transition ${
                  page === idx + 1
                    ? "bg-purple-600 text-white"
                    : "bg-gray-600 hover:bg-purple-700 text-gray-200"
                }`}
                onClick={() => setPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              className={`mx-2 px-4 py-2 rounded-full transition ${
                page === totalPages ? "bg-gray-600 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}