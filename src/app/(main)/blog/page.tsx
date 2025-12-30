import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, User, ArrowRight, Clock } from "lucide-react";

export const metadata = {
  title: "Blog | Pak Auto Generator",
  description: "Latest news, tips, and guides about generators - Pak Auto Generator Blog",
};

const blogPosts = [
  {
    id: 1,
    slug: "how-to-choose-right-generator-for-home",
    title: "How to Choose the Right Generator for Your Home",
    excerpt: "Selecting the perfect generator for your home can be challenging. Learn about different types, power ratings, and features to make an informed decision.",
    image: "/images/blog/choosing-generator.jpg",
    category: "Buying Guide",
    author: "Ahmed Khan",
    date: "December 15, 2024",
    readTime: "8 min read",
  },
  {
    id: 2,
    slug: "generator-maintenance-tips",
    title: "10 Essential Generator Maintenance Tips",
    excerpt: "Regular maintenance is key to keeping your generator running smoothly. Follow these expert tips to extend the life of your generator.",
    image: "/images/blog/maintenance-tips.jpg",
    category: "Maintenance",
    author: "Muhammad Ali",
    date: "December 10, 2024",
    readTime: "6 min read",
  },
  {
    id: 3,
    slug: "understanding-generator-power-ratings",
    title: "Understanding Generator Power Ratings: kVA vs kW",
    excerpt: "Confused about kVA and kW ratings? This comprehensive guide explains the difference and helps you calculate your power needs.",
    image: "/images/blog/power-ratings.jpg",
    category: "Technical",
    author: "Usman Tariq",
    date: "December 5, 2024",
    readTime: "10 min read",
  },
  {
    id: 4,
    slug: "diesel-vs-petrol-generators",
    title: "Diesel vs Petrol Generators: Which is Right for You?",
    excerpt: "Compare fuel efficiency, cost, maintenance, and performance to decide between diesel and petrol generators for your needs.",
    image: "/images/blog/diesel-petrol.jpg",
    category: "Comparison",
    author: "Ahmed Khan",
    date: "November 28, 2024",
    readTime: "7 min read",
  },
  {
    id: 5,
    slug: "generator-safety-tips",
    title: "Generator Safety: Essential Tips to Prevent Accidents",
    excerpt: "Safety should always come first. Learn about proper placement, ventilation, grounding, and other safety measures for generator use.",
    image: "/images/blog/safety-tips.jpg",
    category: "Safety",
    author: "Muhammad Ali",
    date: "November 20, 2024",
    readTime: "5 min read",
  },
  {
    id: 6,
    slug: "signs-generator-needs-repair",
    title: "5 Signs Your Generator Needs Professional Repair",
    excerpt: "Don't wait for a complete breakdown. Learn to recognize early warning signs that indicate your generator needs attention.",
    image: "/images/blog/repair-signs.jpg",
    category: "Maintenance",
    author: "Usman Tariq",
    date: "November 15, 2024",
    readTime: "4 min read",
  },
];

const categories = [
  { name: "All", count: 6 },
  { name: "Buying Guide", count: 1 },
  { name: "Maintenance", count: 2 },
  { name: "Technical", count: 1 },
  { name: "Comparison", count: 1 },
  { name: "Safety", count: 1 },
];

export default function BlogPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Generator Knowledge Hub</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Expert guides, tips, and insights to help you make the most of your generator.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Featured Post */}
          <Card className="mb-8 overflow-hidden">
            <div className="md:flex">
              <div className="md:w-2/5 h-64 md:h-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
              <div className="md:w-3/5 p-6">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-3">
                  Featured
                </span>
                <h2 className="text-2xl font-bold mb-3">{blogPosts[0].title}</h2>
                <p className="text-muted-foreground mb-4">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {blogPosts[0].author}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {blogPosts[0].date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {blogPosts[0].readTime}
                  </span>
                </div>
                <Link href={`/blog/${blogPosts[0].slug}`}>
                  <Button>
                    Read Article
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {blogPosts.slice(1).map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                </div>
                <CardHeader>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded w-fit">
                    {post.category}
                  </span>
                  <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {post.date}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-12">
            <Button variant="outline" disabled>Previous</Button>
            <Button variant="outline" className="bg-primary text-primary-foreground">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.name}>
                    <button className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors text-sm">
                      <span>{category.name}</span>
                      <span className="text-muted-foreground">({category.count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Newsletter */}
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Subscribe to Newsletter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest generator tips and offers directly in your inbox.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="w-full">Subscribe</Button>
              </div>
            </CardContent>
          </Card>

          {/* Popular Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {blogPosts.slice(0, 3).map((post, index) => (
                  <li key={post.id} className="flex gap-3">
                    <span className="text-2xl font-bold text-muted-foreground/30">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="text-sm font-medium line-clamp-2">{post.title}</h4>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
