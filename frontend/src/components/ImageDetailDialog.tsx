"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AuthDialog } from "@/components/AuthDialog";
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

interface ImageDetailDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  image: ImageData | null;
  isLiked: boolean;
  onLike: (imageId: string, isLiked: boolean) => void;
}

export function ImageDetailDialog({
  isOpen,
  setIsOpen,
  image,
  isLiked,
  onLike,
}: ImageDetailDialogProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [shareOptionsVisible, setShareOptionsVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  // Initialize like state when props change
  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);
  
  // Fetch comments when dialog opens
  useEffect(() => {
    if (isOpen && image) {
      fetchComments();
    }
  }, [isOpen, image]);
  
  const fetchComments = async () => {
    if (!image) return;
    
    try {
      setIsLoadingComments(true);
      
      // Replace with your actual API endpoint
      const response = await fetch(`/api/images/${image.id}/comments`);
      
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
    setLocalIsLiked(!localIsLiked);
    
    // Notify parent component
    onLike(image.id, !localIsLiked);
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
      
      // Replace with your actual API endpoint
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
      
      // Add the new comment to the list (optimistic update)
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
  
  if (!image) return null;
  
  const formattedDate = new Date(image.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 h-full max-h-[90vh]">
            {/* Image Section */}
            <div className="relative h-[300px] md:h-full bg-gray-900 md:max-h-[90vh]">
              <Image
                src={image.image_url}
                alt={image.prompt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <DialogClose className="absolute right-2 top-2 z-10 rounded-full bg-black/40 p-1 backdrop-blur-sm text-white hover:bg-black/60">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
            
            {/* Details Section */}
            <div className="flex flex-col h-full overflow-hidden dark:text-gray-100">
              <DialogHeader className="px-6 pt-6 pb-2">
                <div className="flex justify-between items-center mb-2">
                  <DialogTitle className="text-xl">
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
                  </DialogTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className={cn(
                        "rounded-full transition-colors",
                        localIsLiked ? "text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20" : ""
                      )}
                      onClick={handleLikeToggle}
                    >
                      <Heart 
                        className={cn(
                          "h-4 w-4 transition-all",
                          localIsLiked ? "fill-red-500" : ""
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
                      
                      <AnimatePresence>
                        {shareOptionsVisible && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700 w-40"
                          >
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
                          </motion.div>
                        )}
                      </AnimatePresence>
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
              </DialogHeader>
              
              <div className="px-6 py-3 overflow-y-auto flex-1">
                {/* Creator and Date Info */}
                <div className="flex items-center justify-between mb-4">
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
                
                {/* Comments Section */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    Comments <span className="text-gray-500 dark:text-gray-400">({comments.length})</span>
                  </h3>
                  
                  {/* Comments List */}
                  <div className="space-y-4 max-h-[200px] overflow-y-auto mb-4 pr-2">
                    {isLoadingComments ? (
                      <div className="flex justify-center py-4">
                        <motion.div 
                          className="relative"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-400 to-pink-500 opacity-20 blur-sm"></div>
                          <svg className="relative h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </motion.div>
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
                          className="min-h-[80px] pr-10 dark:bg-gray-700 dark:border-gray-600"
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
          </div>
        </DialogContent>
      </Dialog>
      
      <AuthDialog 
        isOpen={showAuthDialog} 
        setIsOpen={setShowAuthDialog} 
        actionType="comment"
      />
    </>
  );
}

// Import needed for X icon in the close button
const X = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
); 