"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Log error for debugging
  useEffect(() => {
    if (error) {
      console.error("Authentication error:", error);
    }
  }, [error]);

  // Get human-readable error message
  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification link was invalid or has expired.";
      case "OAuthSignin":
        return "Error in the OAuth sign-in process.";
      case "OAuthCallback":
        return "Error in the OAuth callback process.";
      case "OAuthCreateAccount":
        return "Could not create OAuth provider user in the database.";
      case "EmailCreateAccount":
        return "Could not create email provider user in the database.";
      case "Callback":
        return "Error in the OAuth callback handler.";
      case "OAuthAccountNotLinked":
        return "The email is already associated with another account.";
      case "SessionRequired":
        return "Authentication required to access this page.";
      default:
        return "An unknown error occurred during authentication.";
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
            <p className="text-red-500 mb-4">{getErrorMessage(error || "")}</p>
            <p className="text-muted-foreground mb-4">
              There was a problem signing you in. Please try again or contact support if the problem persists.
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signin">Try Again</Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
} 