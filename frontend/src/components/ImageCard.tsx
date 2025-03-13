"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/AuthDialog";
import { ImageDetailDialog } from "@/components/ImageDetailDialog";
import { motion } from "framer-motion";
import { Heart, Trash2, Calendar, User } from "lucide-react";

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

interface ImageCardProps {
  image: ImageData;
  userLikedImages: string[];
  onLike: (imageId: string, isLiked: boolean) => void;
  showDeleteButton?: boolean;
  onDelete?: (imageId: string) => void;
}

export function ImageCard({ 
  image, 
  userLikedImages, 
  onLike, 
  showDeleteButton = false, 
  onDelete 
}: ImageCardProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Initialize like state based on userLikedImages
  useEffect(() => {
    setIsLiked(userLikedImages.includes(image.id));
  }, [userLikedImages, image.id]);

  const handleLikeToggle = async (e?: React.MouseEvent) => {
    // Stop propagation to prevent opening detail dialog when like button is clicked
    e?.stopPropagation();
    
    if (!session?.user) {
      setShowAuthDialog(true);
      return;
    }

    // Optimistically update UI
    setIsLiked(!isLiked);
    
    // Notify parent component
    onLike(image.id, !isLiked);
  };

  const handleDelete = (e: React.MouseEvent) => {
    // Stop propagation to prevent opening detail dialog when delete button is clicked
    e.stopPropagation();
    
    if (onDelete) {
      onDelete(image.id);
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    }
  };
  
  const handleCardClick = () => {
    setShowDetailDialog(true);
  };
  
  const formattedDate = new Date(image.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
      >
        <Card 
          className="overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleCardClick}
        >
          <div className="relative aspect-square">
            <Image
              src={image.image_url}
              alt={image.prompt}
              fill
              className="object-cover transition-all duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Overlay with actions */}
            <div 
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="absolute bottom-0 right-0 p-3 flex gap-2">
                <button 
                  onClick={handleLikeToggle}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors",
                    isLiked ? "text-red-500" : "text-white"
                  )}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      isLiked ? "fill-current scale-110" : "scale-100"
                    )}
                  />
                </button>
                
                {showDeleteButton && (
                  <button 
                    onClick={handleDelete}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-4">
            {/* Improved prompt text display - directly show the prompt in bold */}
            <p className="line-clamp-2 text-sm font-bold mb-2 dark:text-white">{image.prompt}</p>
            
            {/* Show refined prompt if available */}
            {image.refined_prompt && (
              <div className="mt-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <p className="line-clamp-2 text-xs italic dark:text-gray-300">{image.refined_prompt}</p>
              </div>
            )}
            
            {/* Image metadata */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <User className="h-3 w-3" />
                <span>{image.userName || 'Anonymous'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>{formattedDate}</span>
                </div>
                
                <div className="flex items-center gap-1 text-xs font-medium">
                  <Heart
                    className={cn(
                      "h-3 w-3",
                      isLiked ? "text-red-500 fill-red-500" : "text-gray-500 dark:text-gray-400"
                    )}
                  />
                  <span className={isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400"}>
                    {image.likes + (isLiked && !userLikedImages.includes(image.id) ? 1 : 0) - (!isLiked && userLikedImages.includes(image.id) ? 1 : 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      <AuthDialog 
        isOpen={showAuthDialog} 
        setIsOpen={setShowAuthDialog} 
        actionType="like"
      />
      
      <ImageDetailDialog
        isOpen={showDetailDialog}
        setIsOpen={setShowDetailDialog}
        image={image}
        isLiked={isLiked}
        onLike={(imageId, isLiked) => onLike(imageId, isLiked)}
      />
    </>
  );
} 