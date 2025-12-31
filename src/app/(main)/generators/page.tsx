"use client";

import { useEffect, useState, Suspense } from "react";
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

interface Generator {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  salePrice?: number;
  stock: number;
  powerKva: number;
  fuelType: string;
  condition: string;
  shortDescription?: string;
  images: { url: string; alt?: string; isPrimary: boolean }[];
  avgRating?: number;
  _count?: { reviews: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function GeneratorsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </div>
  );
}

export default function GeneratorsPage() {
  return (
    <Suspense fallback={<GeneratorsLoading />}>
      <GeneratorsContent />
    </Suspense>
  );
}

function GeneratorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [generators, setGenerators] = useState<Generator[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    fuelType: searchParams.get("fuelType") || "all",
    minPower: searchParams.get("minPower") || "",
    maxPower: searchParams.get("maxPower") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: searchParams.get("sortBy") || "newest",
  });

  const fetchGenerators = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", searchParams.get("page") || "1");
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
      });

      const response = await fetch(`/api/generators?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setGenerators(data.generators);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerators();
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, value);
    });

    router.push(`/generators?${params}`);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      fuelType: "all",
      minPower: "",
      maxPower: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "newest",
    });
    router.push("/generators");
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/generators?${params}`);
  };

  const fuelTypes = ["PETROL", "DIESEL", "GAS", "HYBRID", "SOLAR"];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Generators</h1>
        <p className="text-muted-foreground">
          Browse our wide selection of quality generators
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
                    placeholder="Search generators..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="text-sm font-medium">Fuel Type</label>
                  <Select
                    value={filters.fuelType}
                    onValueChange={(value) =>
                      setFilters({ ...filters, fuelType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {fuelTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0) + type.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Power Range */}
                <div>
                  <label className="text-sm font-medium">Power (kVA)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPower}
                      onChange={(e) =>
                        setFilters({ ...filters, minPower: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPower}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPower: e.target.value })
                      }
                    />
                  </div>
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
                      <SelectItem value="power-low">Power: Low to High</SelectItem>
                      <SelectItem value="power-high">Power: High to Low</SelectItem>
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
          ) : generators.length === 0 ? (
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
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <p className="text-lg font-medium">No generators found</p>
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
                  Showing {generators.length} of {pagination?.total} generators
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {generators.map((generator) => (
                  <Link key={generator.id} href={`/generators/${generator.slug}`}>
                    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {generator.images[0] ? (
                          <img
                            src={generator.images[0].url}
                            alt={generator.images[0].alt || generator.name}
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
                              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                          </div>
                        )}
                        {generator.salePrice && (
                          <Badge className="absolute left-2 top-2" variant="destructive">
                            Sale
                          </Badge>
                        )}
                        {generator.condition !== "NEW" && (
                          <Badge className="absolute right-2 top-2" variant="secondary">
                            {generator.condition}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline">{generator.fuelType}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {generator.powerKva} kVA
                          </span>
                        </div>
                        <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                          {generator.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {generator.brand}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            {generator.salePrice ? (
                              <>
                                <span className="text-lg font-bold text-primary">
                                  {formatPrice(generator.salePrice)}
                                </span>
                                <span className="ml-2 text-sm text-muted-foreground line-through">
                                  {formatPrice(generator.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(generator.price)}
                              </span>
                            )}
                          </div>
                          {generator.stock <= 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : generator.stock <= 5 ? (
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
