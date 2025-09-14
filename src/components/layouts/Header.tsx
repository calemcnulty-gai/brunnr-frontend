/**
 * @fileoverview Application header component with navigation and user menu
 * @module Header
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/layouts/UserAvatar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  return (
    <header className={cn("fixed top-0 z-50 w-full border-b bg-white", className)}>
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-primary">Brunnr</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-4">
          {user && (
            <Link 
              href="/dashboard"
              onClick={(e) => {
                console.log("Header dashboard link clicked, current domain:", window.location.hostname);
                
                // Fallback navigation using router.push for domain-specific issues
                e.preventDefault();
                console.log("Using router.push for header navigation to: /dashboard");
                router.push("/dashboard");
              }}
            >
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
          )}
          
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          ) : user ? (
            <UserAvatar />
          ) : (
            <Link href="/auth/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
