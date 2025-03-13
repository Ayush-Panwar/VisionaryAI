"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Lock, Mail } from "lucide-react";

interface AuthDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  actionType?: string; // e.g., "like", "generate", "continue", etc.
}

export function AuthDialog({ isOpen, setIsOpen, actionType = "continue" }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (provider: string) => {
    try {
      setIsLoading(true);
      await signIn(provider, { callbackUrl: window.location.href });
    } catch (error) {
      toast.error("Error signing in. Please try again.");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionText = () => {
    switch (actionType) {
      case "like":
        return "like images";
      case "generate":
        return "create images";
      case "comment":
        return "add comments";
      case "save":
        return "save images";
      default:
        return "access all features";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogTitle className="sr-only">Sign in to VisionaryAI</DialogTitle>
        
        <div className="flex flex-col">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center mb-4">
              <div className="relative h-10 w-10 mr-3">
                <div className="absolute inset-0 bg-white/20 rounded-lg backdrop-blur-sm"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -right-1 -top-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
              </div>
              <h2 className="text-xl font-bold">Sign in to VisionaryAI</h2>
            </div>
            <p className="text-white/80">
              Join our creative community to {getActionText()} and unlock the full power of AI-generated art.
            </p>
          </div>
          
          {/* Content */}
          <div className="p-6 dark:bg-gray-900">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 dark:text-white">Why sign in?</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Create unlimited AI masterpieces</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Lock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Save your creations to your personal studio</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Mail className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Join our community and interact with other creators</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSignIn("google")} 
                disabled={isLoading}
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                </svg>
                <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
              </Button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-right">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 