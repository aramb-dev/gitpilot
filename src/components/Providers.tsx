"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeListener } from "./ThemeListener";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeListener />
      {children}
    </SessionProvider>
  );
}
