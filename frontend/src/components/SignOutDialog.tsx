"use client"

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LogOut, Brain, Sparkles } from 'lucide-react'

interface SignOutDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function SignOutDialog({ isOpen, setIsOpen }: SignOutDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut({ redirect: false })
      toast.success('Signed out successfully')
      setIsOpen(false)
    } catch (error) {
      toast.error('Error signing out. Please try again.')
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogTitle className="sr-only">Sign out from VisionaryAI</DialogTitle>
        
        <div className="flex flex-col">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center mb-2">
              <div className="relative h-10 w-10 mr-3">
                <div className="absolute inset-0 bg-white/20 rounded-lg backdrop-blur-sm"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -right-1 -top-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
              </div>
              <h2 className="text-xl font-bold">Sign out</h2>
            </div>
            <p className="text-white/80">
              Are you sure you want to sign out from your VisionaryAI account?
            </p>
          </div>
          
          {/* Content */}
          <div className="p-6 dark:bg-gray-900">
            <div className="flex items-center mb-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
              <LogOut className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You can sign back in at any time to access your creations and continue generating AI art.
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)} 
              className="cursor-pointer dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSignOut} 
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500 cursor-pointer text-white dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isLoading ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 