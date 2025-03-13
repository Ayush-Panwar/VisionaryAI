"use client";

import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Only render children once component has mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SessionProvider>
      {mounted ? children : null}
    </SessionProvider>
  );
} 