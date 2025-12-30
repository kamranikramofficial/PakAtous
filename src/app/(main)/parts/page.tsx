"use client";

import { useEffect, useState } from "react";
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

export default function PartsPage() {
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
                          <div className="flex h-full items-center justify-center">
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
                          </div>
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
                        <>
                          {i > 0 && arr[i - 1] !== p - 1 && (
                            <span key={`ellipsis-${p}`} className="px-2">
                              ...
                            </span>
                          )}
                          <Button
                            key={p}
                            variant={pagination.page === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(p)}
                          >
                            {p}
                          </Button>
                        </>
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
    </div>
  );
}
