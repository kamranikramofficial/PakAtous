"use client";

import { Fragment, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";

const partReviewHighlights = [
  {
    id: "p1",
    name: "Hassaan Q.",
    title: "Correct part, first time",
    rating: 4.9,
    body: "They matched my model and shipped the exact carburetor I needed—no returns, no delays.",
  },
  {
    id: "p2",
    name: "Ayesha N.",
    title: "Fast delivery in Lahore",
    rating: 4.8,
    body: "Order was packed well and arrived in two days with tracking updates throughout.",
  },
  {
    id: "p3",
    name: "Bilal S.",
    title: "Helpful support",
    rating: 5,
    body: "Shared photos on WhatsApp, got the right gasket set and install guidance same day.",
  },
];

const Star = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`h-4 w-4 ${filled ? "text-yellow-500" : "text-muted-foreground/40"}`}
    fill="currentColor"
    aria-hidden
  >
    <path d="M12 2.75l2.63 6.03 6.37.45-4.86 4.22 1.48 6.29L12 16.9l-5.62 2.84 1.48-6.29-4.86-4.22 6.37-.45z" />
  </svg>
);

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} filled={i < Math.round(rating)} />
    ))}
    <span className="text-xs font-medium text-muted-foreground">{rating.toFixed(1)}</span>
  </div>
);

interface Part {
  id: string;
  name: string;
  slug: string;
  partNumber?: string;
  price: number;
  salePrice?: number;
  stock: number;
  compatibility?: string;
  shortDescription?: string;
  images: { url: string; alt?: string; isPrimary: boolean }[];
  category?: { name: string; slug: string };
  avgRating?: number;
  _count?: { reviews: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function PartsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </div>
  );
}

export default function PartsPage() {
  return (
    <Suspense fallback={<PartsLoading />}>
      <PartsContent />
    </Suspense>
  );
}

function PartsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [parts, setParts] = useState<Part[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    categoryId: searchParams.get("categoryId") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: searchParams.get("sortBy") || "newest",
  });

  const fetchParts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", searchParams.get("page") || "1");
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
      });

      const response = await fetch(`/api/parts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setParts(data.parts);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    router.push(`/parts?${params}`);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      categoryId: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "newest",
    });
    router.push("/parts");
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/parts?${params}`);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Generator Parts</h1>
        <p className="text-muted-foreground">
          Find genuine spare parts for all generator brands
        </p>
      </div>

      <Card className="mb-8 border-primary/10 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Feedback & support</p>
            <h2 className="text-xl font-bold">Need a part? Tell us and we will reply fast</h2>
            <p className="text-sm text-muted-foreground">
              Share your generator model or photo—our team will confirm compatibility quickly.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/contact">Send feedback</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/faq">View FAQs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>

              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Search parts..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium">Price (PKR)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium">Sort By</label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) =>
                      setFilters({ ...filters, sortBy: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                      <SelectItem value="name-desc">Name: Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : parts.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-lg border bg-muted/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <p className="text-lg font-medium">No parts found</p>
              <p className="text-muted-foreground">
                Try adjusting your filters or search term
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-muted-foreground">
                  Showing {parts.length} of {pagination?.total} parts
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {parts.map((part) => (
                  <Link key={part.id} href={`/parts/${part.slug}`}>
                    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {part.images[0] ? (
                          <img
                            src={part.images[0].url}
                            alt={part.images[0].alt || part.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <img
                            src="/placeholder.svg"
                            alt="Placeholder"
                            className="h-full w-full object-cover"
                          />
                        )}
                        {part.salePrice && (
                          <Badge className="absolute left-2 top-2" variant="destructive">
                            Sale
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        {part.category && (
                          <Badge variant="outline" className="mb-2">
                            {part.category.name}
                          </Badge>
                        )}
                        <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                          {part.name}
                        </h3>
                        {part.partNumber && (
                          <p className="text-sm text-muted-foreground">
                            Part #: {part.partNumber}
                          </p>
                        )}
                        {part.compatibility && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                            Compatible: {part.compatibility}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            {part.salePrice ? (
                              <>
                                <span className="text-lg font-bold text-primary">
                                  {formatPrice(part.salePrice)}
                                </span>
                                <span className="ml-2 text-sm text-muted-foreground line-through">
                                  {formatPrice(part.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(part.price)}
                              </span>
                            )}
                          </div>
                          {typeof part.avgRating === "number" ? (
                            <div className="flex flex-col items-end">
                              <StarRating rating={part.avgRating} />
                              <span className="text-xs text-muted-foreground">
                                {part._count?.reviews ?? 0} reviews
                              </span>
                            </div>
                          ) : part._count?.reviews ? (
                            <span className="text-xs text-muted-foreground">
                              {part._count.reviews} reviews
                            </span>
                          ) : null}
                          {part.stock <= 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : part.stock <= 5 ? (
                            <Badge variant="secondary">Low Stock</Badge>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === pagination.totalPages ||
                          Math.abs(p - pagination.page) <= 2
                      )
                      .map((p, i, arr) => (
                        <Fragment key={p}>
                          {i > 0 && arr[i - 1] !== p - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <Button
                            variant={pagination.page === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(p)}
                          >
                            {p}
                          </Button>
                        </Fragment>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <section className="mt-12 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Reviews</p>
            <h2 className="text-2xl font-bold">What customers say about our parts</h2>
            <p className="text-sm text-muted-foreground">
              Real feedback from buyers who ordered parts and got quick support.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/contact">Share feedback</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/faq">Need help picking a part?</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {partReviewHighlights.map((review) => (
            <Card key={review.id} className="h-full">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  <Badge variant="secondary">Verified buyer</Badge>
                </div>
                <div>
                  <h3 className="text-base font-semibold">{review.title}</h3>
                  <p className="text-sm text-muted-foreground">{review.body}</p>
                </div>
                <p className="mt-auto text-sm font-medium">{review.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
