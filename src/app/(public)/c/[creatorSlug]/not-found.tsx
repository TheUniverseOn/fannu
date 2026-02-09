import Link from "next/link";
import { UserX, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 page for when a creator is not found
 */
export default function CreatorNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <UserX className="h-12 w-12 text-muted-foreground" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Creator Not Found
        </h1>

        {/* Description */}
        <p className="mt-4 text-muted-foreground">
          We couldn&apos;t find the creator you&apos;re looking for. They may have
          changed their profile URL or the page no longer exists.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-muted-foreground">
          If you believe this is an error, please{" "}
          <a
            href="https://wa.me/251900000000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}
