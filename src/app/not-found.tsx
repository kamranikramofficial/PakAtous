import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <div className="mt-4">
          <h2 className="text-3xl font-bold tracking-tight">Page not found</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button size="lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Go Home
            </Button>
          </Link>
          <Link href="/generators">
            <Button variant="outline" size="lg">
              Browse Generators
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-16 grid gap-8 sm:grid-cols-3 max-w-3xl">
        <Link href="/generators" className="group text-center p-6 rounded-lg border hover:border-primary transition-colors">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="16" height="16" x="4" y="4" rx="2"/>
              <rect width="6" height="6" x="9" y="9" rx="1"/>
              <path d="M15 2v2"/>
              <path d="M15 20v2"/>
              <path d="M2 15h2"/>
              <path d="M2 9h2"/>
              <path d="M20 15h2"/>
              <path d="M20 9h2"/>
              <path d="M9 2v2"/>
              <path d="M9 20v2"/>
            </svg>
          </div>
          <h3 className="font-semibold">Generators</h3>
          <p className="text-sm text-muted-foreground mt-1">Browse our collection</p>
        </Link>
        
        <Link href="/parts" className="group text-center p-6 rounded-lg border hover:border-primary transition-colors">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              <path d="M20 3v4"/>
              <path d="M22 5h-4"/>
            </svg>
          </div>
          <h3 className="font-semibold">Parts</h3>
          <p className="text-sm text-muted-foreground mt-1">Find replacement parts</p>
        </Link>
        
        <Link href="/services" className="group text-center p-6 rounded-lg border hover:border-primary transition-colors">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <h3 className="font-semibold">Services</h3>
          <p className="text-sm text-muted-foreground mt-1">Get professional help</p>
        </Link>
      </div>
    </div>
  );
}
