"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ImageCard } from "@/components/ImageCard";
import { motion } from "framer-motion";
import { Grid, Sparkles, Clock, Heart, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageData {
  id: string;
  prompt: string;
  refined_prompt?: string | null;
  image_url: string;
  created_at: string;
  likes: number;
  userId: string;
  userName?: string;
}

type TabType = "recent" | "mostLiked";

export default function ExplorePage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [likedImages, setLikedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("recent");
  const { data: session } = useSession();
  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastImageElementRef = useCallback((node: Element | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        if (activeTab === "recent") {
          fetchImages(page + 1);
        } else {
          fetchMostLikedImages(page + 1);
        }
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, activeTab]);

  useEffect(() => {
    if (activeTab === "recent") {
      fetchImages(1, true);
    } else {
      fetchMostLikedImages(1, true);
    }
    
    if (session?.user?.email) {
      fetchLikedImages();
    }
  }, [session, activeTab]);

  const fetchLikedImages = async () => {
    if (!session?.user?.email) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/liked`, {
        headers: {
          'user-id': session.user.email,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch liked images');
      }

      const data = await response.json();
      setLikedImages(data);
    } catch (error) {
      console.error('Error fetching liked images:', error);
    }
  };

  const fetchImages = async (pageNum: number, reset: boolean = false) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/explore?offset=${(pageNum-1) * 20}&limit=20`);

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      
      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      if (reset) {
        setImages(data);
        setPage(pageNum);
      } else {
        setImages(prev => [...prev, ...data]);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error",
        description: "Failed to load creations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMostLikedImages = async (pageNum: number, reset: boolean = false) => {
    setLoading(true);
    try {
      // Using the optional sort parameter to sort by likes in descending order
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/images/explore?offset=${(pageNum-1) * 20}&limit=20&sort=likes`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch most liked images');
      }

      const data = await response.json();
      
      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      if (reset) {
        setImages(data);
        setPage(pageNum);
      } else {
        setImages(prev => [...prev, ...data]);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching most liked images:', error);
      toast({
        title: "Error",
        description: "Failed to load trending creations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (imageId: string, isLiked: boolean) => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like creations",
        variant: "destructive",
      });
      return;
    }

    try {
      const endpoint = isLiked ? 'like' : 'unlike';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': session.user.email || '',
        },
        body: JSON.stringify({
          imageId: imageId,
          userId: session.user.email,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isLiked ? 'like' : 'unlike'} image`);
      }

      // Update the likes count in the UI
      setImages(images.map(img => 
        img.id === imageId ? { ...img, likes: isLiked ? img.likes + 1 : img.likes - 1 } : img
      ));
      
      // Update liked images list
      if (isLiked) {
        setLikedImages(prev => [...prev, imageId]);
      } else {
        setLikedImages(prev => prev.filter(id => id !== imageId));
      }
      
      toast({
        title: "Success",
        description: `Creation ${isLiked ? 'liked' : 'unliked'} successfully`,
      });
    } catch (error) {
      console.error(`Error ${isLiked ? 'liking' : 'unliking'} creation:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isLiked ? 'like' : 'unlike'} the creation`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative w-10 h-10 mr-3">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-80"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -right-1 -top-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Explore Gallery
            </h1>
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover stunning AI-powered creations from our vibrant community
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm flex max-w-sm mx-auto">
            <button
              onClick={() => setActiveTab("recent")}
              className={cn(
                "flex items-center justify-center px-6 py-2 text-sm font-medium rounded-full transition-all",
                activeTab === "recent"
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Clock className="h-4 w-4 mr-2" />
              Latest
            </button>
            <button
              onClick={() => setActiveTab("mostLiked")}
              className={cn(
                "flex items-center justify-center px-6 py-2 text-sm font-medium rounded-full transition-all",
                activeTab === "mostLiked"
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Heart className="h-4 w-4 mr-2" />
              Trending
            </button>
          </div>
        </div>
        
        {loading && images.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-20 h-20"
              >
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-12 w-12 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </motion.div>
              <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading {activeTab === "mostLiked" ? "trending" : "latest"} creations...
              </p>
            </div>
          </div>
        ) : images.length === 0 ? (
          <motion.div 
            className="text-center py-16 rounded-xl bg-white dark:bg-gray-800 shadow-xl max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-pink-100 dark:from-indigo-900/30 dark:to-pink-900/30 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Grid className="h-10 w-10 text-purple-500 dark:text-purple-400" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No creations available yet</h2>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">Be the first to create an amazing AI masterpiece!</p>
            <Link 
              href="/generate"
              className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 px-6 text-sm font-medium text-white shadow transition-colors"
            >
              <Sparkles className="mr-2 h-4 w-4" /> 
              Create the first vision
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                ref={index === images.length - 1 ? lastImageElementRef : undefined}
              >
                <ImageCard
                  image={image}
                  userLikedImages={likedImages}
                  onLike={handleLikeToggle}
                />
              </div>
            ))}
            {loading && hasMore && (
              <div className="col-span-full flex justify-center p-8">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-indigo-400 to-pink-500 opacity-20 blur-xl animate-pulse"></div>
                    <svg className="relative animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="mt-3 text-gray-700 dark:text-gray-300 font-medium">
                    Loading more {activeTab === "mostLiked" ? "trending" : "latest"} creations...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 