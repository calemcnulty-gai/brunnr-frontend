import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome to Brunnr
          </h1>
          <p className="max-w-2xl text-xl text-gray-600">
            Transform educational questions into engaging animated videos with the power of AI.
            Perfect for educators, students, and lifelong learners.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="h-12 px-8 text-base">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              Sign In
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 grid gap-8 text-center sm:grid-cols-3">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-primary-light p-3">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Ask Questions</h3>
            <p className="text-gray-600">Enter any educational topic or question</p>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-primary-light p-3">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Generate Videos</h3>
            <p className="text-gray-600">AI creates engaging animated content</p>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-primary-light p-3">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Share & Learn</h3>
            <p className="text-gray-600">Download and share educational videos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
