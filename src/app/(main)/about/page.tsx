import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us | Pak Auto Generator",
  description: "Learn about Pak Auto Generator - Pakistan's leading generator supplier with years of experience in quality generators, parts, and services.",
};

export default function AboutPage() {
  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About Pak Auto Generator</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Pakistan&apos;s trusted source for quality generators, genuine parts, and professional services since 2010.
        </p>
      </div>

      {/* Story Section */}
      <div className="grid gap-12 lg:grid-cols-2 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Story</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Founded in 2010, Pak Auto Generator started with a simple mission: to provide Pakistan with reliable power solutions. What began as a small shop in Lahore has grown into one of the country&apos;s most trusted generator suppliers.
            </p>
            <p>
              Over the years, we have served thousands of satisfied customers across Pakistan, from residential homes to large industrial facilities. Our commitment to quality products and exceptional service has made us the preferred choice for generators and generator parts.
            </p>
            <p>
              Today, we continue to expand our offerings while maintaining the same dedication to customer satisfaction that has defined us from day one.
            </p>
          </div>
        </div>
        <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
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
            <p>Company Image</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-primary mb-2">15+</div>
            <p className="text-muted-foreground">Years of Experience</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
            <p className="text-muted-foreground">Happy Customers</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <p className="text-muted-foreground">Products Available</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-primary mb-2">50+</div>
            <p className="text-muted-foreground">Expert Technicians</p>
          </CardContent>
        </Card>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <CardTitle>Quality Assurance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We only sell genuine products from trusted manufacturers. Every generator and part goes through rigorous quality checks before reaching our customers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <CardTitle>Customer First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our customers are at the heart of everything we do. We strive to provide exceptional service, expert advice, and after-sales support.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <CardTitle>Expert Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our team of certified technicians provides professional installation, maintenance, and repair services for all types of generators.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Services Overview */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">What We Offer</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-6 rounded-lg border hover:border-primary transition-colors">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
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
            <h3 className="font-semibold mb-2">Generators</h3>
            <p className="text-sm text-muted-foreground">Wide range of generators for home, commercial, and industrial use</p>
          </div>

          <div className="text-center p-6 rounded-lg border hover:border-primary transition-colors">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                <path d="M20 3v4"/>
                <path d="M22 5h-4"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Genuine Parts</h3>
            <p className="text-sm text-muted-foreground">Original spare parts for all major generator brands</p>
          </div>

          <div className="text-center p-6 rounded-lg border hover:border-primary transition-colors">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Maintenance</h3>
            <p className="text-sm text-muted-foreground">Regular maintenance and servicing packages</p>
          </div>

          <div className="text-center p-6 rounded-lg border hover:border-primary transition-colors">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"/>
                <path d="m13.56 11.747 4.332-.924"/>
                <path d="m16 21-3.105-6.21"/>
                <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"/>
                <path d="m6.158 8.633 1.114 4.456"/>
                <path d="m8 21 3.105-6.21"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Emergency Repairs</h3>
            <p className="text-sm text-muted-foreground">24/7 emergency repair services across Pakistan</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-primary/5 rounded-2xl p-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Whether you need a new generator, replacement parts, or professional service, we&apos;re here to help. Contact us today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/generators">
            <Button size="lg">
              Browse Generators
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
