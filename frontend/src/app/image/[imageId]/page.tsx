"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/AuthDialog";
import { motion } from "framer-motion";
import { 
  Heart, 
  Download, 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Copy, 
  Calendar, 
  User,
  MessageSquare,
  Send,
  Sparkles,
  Check,
} from "lucide-react";

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

interface Comment {
  id: string;
  imageId: string;
  userId: string;
  userName: string;
  text: string;
  created_at: string;
}

export default function ImagePage() {
  const params = useParams();
  const imageId = params.imageId as string;
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [image, setImage] = useState<ImageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [shareOptionsVisible, setShareOptionsVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  // Fetch image data when component mounts
  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/images/${imageId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }
        
        const data = await response.json();
        setImage(data);
        
        // Check if user liked this image
        if (session?.user) {
          const likedResponse = await fetch(`/api/images/liked`);
          if (likedResponse.ok) {
            const likedImages = await likedResponse.json();
            setIsLiked(likedImages.includes(imageId));
          }
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        toast({
          title: "Error",
          description: "Failed to load image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (imageId) {
      fetchImage();
    }
  }, [imageId, session, toast]);
  
  // Fetch comments when image data is available
  useEffect(() => {
    if (image) {
      fetchComments();
    }
  }, [image]);
  
  const fetchComments = async () => {
    if (!imageId) return;
    
    try {
      setIsLoadingComments(true);
      
      const response = await fetch(`/api/images/${imageId}/comments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  const handleLikeToggle = async () => {
    if (!session?.user) {
      setShowAuthDialog(true);
      return;
    }
    
    if (!image) return;
    
    // Optimistically update UI
    setIsLiked(!isLiked);
    
    try {
      const endpoint = isLiked ? '/api/images/unlike' : '/api/images/like';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: image.id,
          userId: session.user.id,
        }),
      });
      
      if (!response.ok) {
        // Revert optimistic update if request fails
        setIsLiked(isLiked);
        throw new Error(`Failed to ${isLiked ? 'unlike' : 'like'} image`);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: `Failed to ${isLiked ? 'unlike' : 'like'} image. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  const handleShareClick = () => {
    setShareOptionsVisible(!shareOptionsVisible);
  };
  
  const handleDownload = async () => {
    if (!image) return;
    
    try {
      // Fetch the image and create a download link
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visionary-ai-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Image downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Error",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const shareToSocial = (platform: string) => {
    if (!image) return;
    
    const url = `${window.location.origin}/image/${image.id}`;
    let shareUrl = '';
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=Check out this amazing AI-generated image!&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=AI-Generated Image&summary=${encodeURIComponent(image.prompt)}`;
        break;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setShareOptionsVisible(false);
  };
  
  const copyToClipboard = () => {
    if (!image) return;
    
    const url = `${window.location.origin}/image/${image.id}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link Copied",
      description: "Image link copied to clipboard",
    });
    
    setShareOptionsVisible(false);
  };
  
  const handleSubmitComment = async () => {
    if (!session?.user) {
      setShowAuthDialog(true);
      return;
    }
    
    if (!image || !newComment.trim()) return;
    
    try {
      setIsSubmittingComment(true);
      
      const response = await fetch(`/api/images/${image.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: newComment,
          userId: session.user.id,
          userName: session.user.name,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }
      
      // Add the new comment to the list
      const data = await response.json();
      setComments([...comments, data.comment]);
      setNewComment(''); // Clear input
      
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
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
              Loading masterpiece...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!image) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="container mx-auto py-20 flex items-center justify-center">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold mb-4">Image Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The image you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={() => window.location.href = "/explore"}>
              Browse Gallery
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const formattedDate = new Date(image.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      
      <main className="container mx-auto py-8 px-4 md:py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Image Section */}
              <div className="lg:col-span-2 relative aspect-square md:aspect-auto md:h-[600px] lg:h-[700px] bg-gray-900">
                <Image
                  src={image.image_url}
                  alt={image.prompt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                  priority
                />
              </div>
              
              {/* Details Section */}
              <div className="flex flex-col p-6 md:max-h-[600px] lg:max-h-[700px] overflow-y-auto">
                <div className="mb-6">
                  <div className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-80"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                          AI Creation
                        </span>
                      </div>
                    </h1>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className={cn(
                          "rounded-full transition-colors",
                          isLiked ? "text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20" : ""
                        )}
                        onClick={handleLikeToggle}
                      >
                        <Heart 
                          className={cn(
                            "h-4 w-4 transition-all",
                            isLiked ? "fill-red-500" : ""
                          )}
                        />
                      </Button>
                      <div className="relative">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full"
                          onClick={handleShareClick}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        
                        {shareOptionsVisible && (
                          <div className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700 w-40">
                            <div className="flex flex-col gap-1">
                              <button 
                                onClick={() => shareToSocial('twitter')}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm transition-colors"
                              >
                                <Twitter className="h-4 w-4 text-blue-400" />
                                <span>Twitter</span>
                              </button>
                              <button 
                                onClick={() => shareToSocial('facebook')}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm transition-colors"
                              >
                                <Facebook className="h-4 w-4 text-blue-600" />
                                <span>Facebook</span>
                              </button>
                              <button 
                                onClick={() => shareToSocial('linkedin')}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm transition-colors"
                              >
                                <Linkedin className="h-4 w-4 text-blue-800" />
                                <span>LinkedIn</span>
                              </button>
                              <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-1" />
                              <button 
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm transition-colors"
                              >
                                <Copy className="h-4 w-4" />
                                <span>Copy Link</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Creator and Date Info */}
                  <div className="flex items-center justify-between my-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{image.userName || 'Anonymous'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Creator</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                  
                  {/* Prompt Information */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Prompt
                    </h3>
                    <p className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm dark:text-gray-300">
                      {image.prompt}
                    </p>
                    
                    {image.refined_prompt && (
                      <div className="mt-3">
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                          <Check className="h-4 w-4 text-green-500" />
                          Refined Prompt
                        </h3>
                        <p className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm italic dark:text-gray-300">
                          {image.refined_prompt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Comments Section */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    Comments <span className="text-gray-500 dark:text-gray-400">({comments.length})</span>
                  </h3>
                  
                  {/* Comments List */}
                  <div className="space-y-4 flex-1 overflow-y-auto mb-4 pr-2">
                    {isLoadingComments ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                      </div>
                    ) : comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-800 dark:text-indigo-300">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="text-sm font-medium">{comment.userName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm mt-1">{comment.text}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No comments yet. Be the first to comment!</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Comment Form */}
                  <div className="mt-auto">
                    <div className="flex gap-2 items-start">
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
                        {session?.user?.name?.charAt(0).toUpperCase() || 'G'}
                      </div>
                      <div className="flex-1 relative">
                        <Textarea 
                          placeholder="Add a comment..." 
                          className="min-h-[80px] pr-10"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          disabled={isSubmittingComment || !session}
                        />
                        <Button
                          size="icon"
                          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
                          onClick={handleSubmitComment}
                          disabled={isSubmittingComment || !newComment.trim() || !session}
                        >
                          {isSubmittingComment ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {!session && (
                      <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                        <button 
                          className="text-purple-500 hover:underline" 
                          onClick={() => setShowAuthDialog(true)}
                        >
                          Sign in
                        </button> to add a comment
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <AuthDialog 
        isOpen={showAuthDialog} 
        setIsOpen={setShowAuthDialog} 
        actionType="comment"
      />
    </div>
  );
} 