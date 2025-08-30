import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Create a new video or manage your existing projects.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Generate</CardTitle>
            <CardDescription>
              Create a video from a question in one click
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/generate">
              <Button className="w-full">
                Start Generating
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
            <CardDescription>
              View and manage your video projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/projects">
              <Button variant="outline" className="w-full">
                View Projects
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step-by-Step</CardTitle>
            <CardDescription>
              Full control over the generation pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/pipeline">
              <Button variant="outline" className="w-full">
                Advanced Mode
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest video generation projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-gray-500">
            <p>No projects yet. Create your first video to get started!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
