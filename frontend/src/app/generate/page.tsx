"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Download, Save, ArrowRight, Zap, X, Check, Brain } from "lucide-react";
import { AuthDialog } from "@/components/AuthDialog";
import { cn } from "@/lib/utils";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [refinePrompt, setRefinePrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [refinedPrompt, setRefinedPrompt] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [promptSuggestions] = useState([
    "A serene Japanese garden with cherry blossoms, tranquil pond, and traditional architecture",
    "A futuristic cityscape at night with neon lights, flying cars, and towering buildings",
    "A cozy cabin in snow-covered mountains with smoke coming from the chimney",
    "An underwater scene with colorful coral reef and exotic fish in crystal clear water"
  ]);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      setShowAuthDialog(true);
    }
  }, [status]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a description of what you'd like to create",
        variant: "destructive",
      });
      promptRef.current?.focus();
      return;
    }

    if (status !== "authenticated") {
      setShowAuthDialog(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setRefinedPrompt(null);
    setIsSaved(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': session?.user?.email || '',
        },
        body: JSON.stringify({
          prompt: prompt,
          refine_prompt: refinePrompt,
          skip_cloudinary: true
        }),
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      setIsGenerating(false);
      setGeneratedImage(data.image_url);
      
      if (data.refined_prompt) {
        setRefinedPrompt(data.refined_prompt);
      }
      
      toast({
        title: "Creation Complete",
        description: "Your vision has been brought to life. Click 'Save to Studio' to keep it.",
      });
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
      toast({
        title: "Creation Failed",
        description: "We couldn't create your vision. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveImage = async () => {
    if (!generatedImage || isSaved) return;
    
    setIsSaving(true);
    
    try {
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': session?.user?.email || '',
        },
        body: JSON.stringify({
          image_url: generatedImage,
        }),
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to Cloudinary');
      }
      
      const uploadData = await uploadResponse.json();
      const cloudinaryUrl = uploadData.cloudinary_url;
      
      const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': session?.user?.email || '',
        },
        body: JSON.stringify({
          image_url: cloudinaryUrl,
          prompt: prompt,
          refined_prompt: refinedPrompt
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save to database');
      }

      await saveResponse.json();
      
      setIsSaved(true);
      toast({
        title: "Saved to Your Studio",
        description: "Your creation is now in your personal collection",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Save Failed",
        description: "We couldn't save your creation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    promptRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative w-10 h-10 mr-3">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -right-1 -top-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                Create with VisionaryAI
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Describe your imagination, and watch as our AI brings your creative vision to life.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Input Section */}
            <Card className="lg:col-span-2 p-6 bg-white dark:bg-gray-800 shadow-lg border-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-b from-indigo-100/30 to-pink-100/30 dark:from-indigo-900/10 dark:to-pink-900/5 rounded-bl-full -z-10"></div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Describe your vision
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Be as detailed as possible for the most captivating results
                  </p>
                  <Textarea
                    ref={promptRef}
                    placeholder="e.g., A serene mountain landscape at sunrise with fog in the valley, dramatic lighting, and vibrant colors..."
                    value={prompt}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                    className="w-full p-4 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors min-h-[150px]"
                    rows={7}
                  />
                </div>
                
                {/* Prompt Suggestions */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Need inspiration? Try one of these:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {suggestion.length > 30 ? suggestion.substring(0, 30) + '...' : suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="refine"
                        checked={refinePrompt}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRefinePrompt(e.target.checked)}
                        className="sr-only"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full shadow-inner transition-colors"></div>
                      <div className={cn(
                        "absolute left-0.5 top-0.5 w-5 h-5 bg-white dark:bg-gray-100 rounded-full shadow transform transition-transform",
                        refinePrompt ? "translate-x-5 bg-purple-500 dark:bg-purple-400" : "translate-x-0"
                      )}></div>
                    </div>
                    <div className="ml-3 text-gray-700 dark:text-gray-200 font-medium flex items-center">
                      <Zap className="h-4 w-4 text-amber-400 mr-1.5" />
                      Enhance with AI
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gradient-to-r from-indigo-100 to-pink-100 dark:from-indigo-900 dark:to-pink-900 text-indigo-800 dark:text-indigo-200 rounded">
                        PRO
                      </span>
                    </div>
                  </label>
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full group relative h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isGenerating ? 'opacity-100' : 'opacity-0'}`}>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2">Creating...</span>
                  </span>
                  <span className={`flex items-center justify-center transition-opacity duration-300 ${isGenerating ? 'opacity-0' : 'opacity-100'}`}>
                    <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                    Create Vision
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </div>
            </Card>
            
            {/* Output Section */}
            <div className="lg:col-span-3 h-full flex flex-col">
              <AnimatePresence mode="wait">
                {generatedImage ? (
                  <motion.div
                    key="generated"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg border-0 h-full flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                          <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
                          Your Creation
                        </h2>
                        <button 
                          onClick={() => {
                            setGeneratedImage(null);
                            setRefinedPrompt(null);
                            setIsSaved(false);
                          }}
                          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors"
                          aria-label="Start over"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="relative aspect-square w-full md:w-2/3 border rounded-lg overflow-hidden shadow-inner bg-gray-100 dark:bg-gray-700 flex-grow">
                          <Image
                            src={generatedImage}
                            alt="AI-created image"
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        <div className="md:w-1/3 flex flex-col justify-between gap-4">
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-1">Your Prompt:</h3>
                              <p className="text-gray-900 dark:text-white text-sm">{prompt}</p>
                            </div>
                            
                            {refinedPrompt && (
                              <div className="p-4 bg-gradient-to-r from-indigo-50 to-pink-50 dark:from-indigo-900/20 dark:to-pink-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                <h3 className="font-medium text-sm text-indigo-600 dark:text-indigo-400 mb-1 flex items-center">
                                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                                  AI Enhanced:
                                </h3>
                                <p className="text-gray-800 dark:text-gray-200 text-sm">{refinedPrompt}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-3">
                            <button 
                              onClick={handleSaveImage}
                              disabled={isSaving || isSaved}
                              className={`w-full relative flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${isSaved ? 'bg-green-500 cursor-default' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600'} disabled:opacity-50`}
                            >
                              {isSaving ? (
                                <>
                                  <span className="opacity-0 flex items-center gap-1.5">
                                    <Save className="h-4 w-4" />
                                    Save to Studio
                                  </span>
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                  </span>
                                </>
                              ) : isSaved ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Saved to Studio
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  Save to Studio
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => window.open(generatedImage, '_blank')}
                              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg border-0 h-full flex flex-col justify-center items-center text-center">
                      <div className="relative w-32 h-32 mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/50 to-pink-200/50 dark:from-indigo-900/30 dark:to-pink-900/30 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Brain className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Your Vision Awaits</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                        Describe your idea in detail on the left and click &apos;Create Vision&apos; to see your imagination come to life.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <div className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs">Realistic Photography</div>
                        <div className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs">Digital Art</div>
                        <div className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs">3D Rendering</div>
                        <div className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs">Anime Style</div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>
      
      <AuthDialog 
        isOpen={showAuthDialog} 
        setIsOpen={setShowAuthDialog} 
        actionType="create" 
      />
    </div>
  );
} 