/**
 * @fileoverview Application header component with navigation and user menu
 * @module Header
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("fixed top-0 z-50 w-full border-b bg-white", className)}>
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-primary">Brunnr</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
