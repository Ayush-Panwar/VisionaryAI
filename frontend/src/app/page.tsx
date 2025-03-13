"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star, Shield, Zap, Heart, CheckCircle, ArrowRight, Brain } from "lucide-react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Custom animation styles */}
      <style jsx global>{`
        @keyframes slow-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-slow-spin {
          animation: slow-spin 12s linear infinite;
        }
      `}</style>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-10 md:pb-40">
        {/* Background gradient effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-b from-indigo-100/40 to-transparent dark:from-indigo-900/10 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-pink-100/30 to-transparent dark:from-pink-900/10 rounded-tr-full"></div>
        </div>

        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col space-y-8 max-w-xl">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 sm:mb-6 text-sm font-medium bg-gradient-to-r from-indigo-100 to-pink-100 dark:from-indigo-900/40 dark:to-pink-900/40 text-indigo-800 dark:text-indigo-300 rounded-full self-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Powered by DALL-E 3 Technology</span>
              </motion.div>
              
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Unleash Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Creative Vision</span> with AI
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
                  Transform your imagination into stunning visual masterpieces with our premium AI image generation platform. No design skills needed.
                </p>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link 
                  href="/generate"
                  className="inline-flex h-12 items-center justify-center rounded-lg px-8 text-base font-medium !text-white shadow-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all group"
                >
                  <Sparkles className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  href="/explore"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm px-8 text-base font-medium text-gray-800 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  Explore Gallery
                </Link>
              </motion.div>
              
              <motion.div
                className="pt-6 flex gap-8 items-center text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>HD Quality</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free Tier Available</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-70 animate-pulse"></div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800">
                {/* Premium AI-generated hero image */}
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mix-blend-overlay opacity-30"></div>
        <Image
                    src="https://res.cloudinary.com/dwn7fa8fp/image/upload/v1741769046/hnxn0dceapc6rssjy441.webp"
                    alt="AI Generated Digital Masterpiece"
                    fill
                    className="object-cover"
          priority
        />
                  {/* Premium AI image from Unsplash - AI generated digital art */}
                </div>
                
                {/* Floating badge element */}
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-xs font-medium text-purple-600 dark:text-purple-400 shadow-md flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5" />
                  Created with VisionaryAI
                </div>
              </div>
              
              {/* Testimonial element */}
              <div className="absolute -bottom-6 -left-6 max-w-xs bg-white dark:bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">5.0 rating</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  &ldquo;The quality of images I&rsquo;ve created is simply stunning. This platform has revolutionized my creative process.&rdquo;
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative w-12 h-12 mr-3">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -right-1 -top-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                Premium Features
              </h2>
            </div>
            <p className="mx-auto mt-4 text-lg text-gray-600 dark:text-gray-400">
              Our state-of-the-art platform combines cutting-edge AI technology with an intuitive interface to deliver the ultimate creative experience.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex flex-col h-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-bl from-indigo-100 to-pink-100 dark:from-indigo-900/20 dark:to-pink-900/20 rounded-full blur-xl opacity-70"></div>
                  
                  <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-4 self-start">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 flex-grow">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div 
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 md:p-12 lg:p-16 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute top-0 right-0 w-1/2 h-full">
              <svg viewBox="0 0 100 100" className="absolute h-full w-full opacity-20">
                <circle cx="80" cy="20" r="15" fill="white" />
                <circle cx="10" cy="70" r="10" fill="white" />
                <circle cx="50" cy="50" r="5" fill="white" />
                <circle cx="30" cy="15" r="8" fill="white" />
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-4">
                  Ready to Create Masterpieces?
                </h2>
                <p className="text-lg text-indigo-100 mb-6 max-w-lg">
                  Join thousands of creators already using VisionaryAI to bring their ideas to life. Start your creative journey today.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link 
                    href="/generate"
                    className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-medium text-purple-600 shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Try for Free
                  </Link>
                  <Link 
                    href="/explore"
                    className="inline-flex h-12 items-center justify-center rounded-lg px-8 text-base font-medium !text-white bg-indigo-600/30 hover:bg-indigo-600/40 backdrop-blur-sm transition-colors border border-indigo-400/30"
                  >
                    View Gallery
                  </Link>
                </div>
              </div>
              
              <div className="hidden lg:flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl p-6 w-64 h-64">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="200" height="200" viewBox="0 0 200 200" className="animate-slow-spin">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="50%" stopColor="#D946EF" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
                      <circle cx="100" cy="100" r="80" fill="none" stroke="url(#gradient)" strokeWidth="4" strokeDasharray="502" strokeDashoffset="150" />
                    </svg>
                  </div>
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-80"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="h-16 w-16 text-white" />
                    </div>
                    <div className="absolute -right-1 -top-1">
                      <Sparkles className="h-5 w-5 text-amber-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-10">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <div className="relative h-10 w-10 mr-2">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -right-1 -top-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
              </div>
              <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                VisionaryAI
              </div>
            </div>
            
            <div className="flex gap-8 text-sm text-gray-600 dark:text-gray-400">
              <Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Contact</Link>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2023 VisionaryAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Advanced AI Technology",
    description: "Powered by DALL-E 3, our platform generates ultra-realistic, highly detailed images that perfectly capture your vision.",
    icon: <Brain className="h-6 w-6 text-white" />,
  },
  {
    title: "Instant Creation",
    description: "Transform your ideas into stunning visuals in seconds with our optimized generation process.",
    icon: <Zap className="h-6 w-6 text-white" />,
  },
  {
    title: "Smart Prompt Enhancement",
    description: "Our AI automatically refines your prompts to produce the highest quality results possible.",
    icon: <Sparkles className="h-6 w-6 text-white" />,
  },
  {
    title: "Unlimited Possibilities",
    description: "From photorealistic imagery to artistic styles, create any visual concept you can imagine.",
    icon: <Star className="h-6 w-6 text-white" />,
  },
  {
    title: "Personal Creative Studio",
    description: "Organize and manage all your creations in a beautiful, intuitive personal dashboard.",
    icon: <Heart className="h-6 w-6 text-white" />,
  },
  {
    title: "Premium Export Options",
    description: "Download your creations in high resolution formats perfect for professional use.",
    icon: <Shield className="h-6 w-6 text-white" />,
  },
];
