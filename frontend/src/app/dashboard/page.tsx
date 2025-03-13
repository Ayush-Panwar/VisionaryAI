"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageCard } from "@/components/ImageCard";
import { motion } from "framer-motion";
import { PlusCircle, Sparkles, Brain, Grid3X3 } from "lucide-react";

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

export default function DashboardPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [likedImages, setLikedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchLikedImages = useCallback(async () => {
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
  }, [session?.user?.email]);

  const fetchUserImages = useCallback(async () => {
    if (!session?.user?.email) return;
      
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/user`, {
        headers: {
          'user-id': session?.user?.email || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error",
        description: "Failed to load your creations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, toast]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status !== "authenticated") return;
      
      await Promise.all([
        fetchUserImages(),
        fetchLikedImages()
      ]);
    };

    fetchUserData();
  }, [status, fetchUserImages, fetchLikedImages]);

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

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this creation?")) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'user-id': session?.user?.email || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete creation');
      }

      // Remove the deleted image from the state
      setImages(images.filter(img => img.id !== imageId));
      
      toast({
        title: "Success",
        description: "Creation deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting creation:', error);
      toast({
        title: "Error",
        description: "Failed to delete the creation",
        variant: "destructive",
      });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto p-4 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-20 h-20"
            >
              <motion.div 
                className="absolute inset-0 rounded-full bg-purple-500 opacity-20"
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
            <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading your creations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center">
              <div className="relative h-10 w-10 mr-3">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Grid3X3 className="h-5 w-5 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                Creative Studio
              </h1>
            </div>
            <Link
              href="/generate"
              className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 px-6 text-sm font-medium !text-white shadow transition-colors"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Vision
            </Link>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400 pl-1">
            Manage your creative portfolio and organize your AI-powered masterpieces
          </p>
        </motion.div>

        {images.length === 0 ? (
          <motion.div 
            className="text-center py-16 rounded-xl bg-white dark:bg-gray-800 shadow-xl max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-pink-100 dark:from-indigo-900/30 dark:to-pink-900/30 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-10 w-10 text-purple-500 dark:text-purple-400" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Your studio is empty</h2>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              You haven&apos;t created any visions yet. Start creating your first AI masterpiece now!
            </p>
            <Link 
              href="/generate"
              className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 px-6 text-sm font-medium !text-white shadow transition-colors"
            >
              <Sparkles className="mr-2 h-4 w-4" /> 
              Create Your First Vision
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ImageCard
                  image={image}
                  userLikedImages={likedImages}
                  onLike={handleLikeToggle}
                  showDeleteButton={true}
                  onDelete={handleDeleteImage}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 