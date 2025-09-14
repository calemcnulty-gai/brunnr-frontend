/**
 * @fileoverview Dashboard sidebar navigation component
 * @module Sidebar
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: "Generate",
    href: "/dashboard/generate",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Debug logging for navigation issues
  console.log("Sidebar pathname:", pathname, "domain:", typeof window !== 'undefined' ? window.location.hostname : 'server');

  return (
    <div
      className={cn(
        "fixed left-0 top-14 h-[calc(100vh-56px)] w-[280px] border-r bg-gradient-to-b from-primary to-primary-hover",
        className
      )}
    >
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          // Fix highlighting logic to be more precise
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}/`));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => {
                console.log("Sidebar link clicked:", item.name, item.href, "current pathname:", pathname);
                
                // Fallback navigation using router.push for domain-specific issues
                e.preventDefault();
                console.log("Using router.push for navigation to:", item.href);
                router.push(item.href);
                
                // Add a timeout to check if navigation succeeded
                setTimeout(() => {
                  console.log("Navigation check - current pathname after 500ms:", window.location.pathname);
                }, 500);
              }}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-white border-l-[3px] border-blue-400"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Help section commented out until docs are ready */}
      {/*
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="rounded-lg bg-white/10 p-4">
          <h3 className="text-sm font-medium text-white">Need Help?</h3>
          <p className="mt-1 text-xs text-white/80">
            Check our documentation or contact support
          </p>
          <Link href="/docs">
            <Button size="sm" variant="secondary" className="mt-3 w-full">
              View Docs
            </Button>
          </Link>
        </div>
      </div>
      */}
    </div>
  );
}
