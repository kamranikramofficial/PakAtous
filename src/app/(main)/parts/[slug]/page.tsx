"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/store/cart-store";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { useSettings } from "@/contexts/settings-context";

interface Part {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  compatibility: string;
  specifications: Record<string, string>;
  isActive: boolean;
  isFeatured: boolean;
  images: { id: string; url: string; alt?: string; isPrimary: boolean }[];
  category: { name: string; slug: string };
  brand?: { name: string };
  reviews: {
    id: string;
    rating: number;
    title: string;
    content: string;
    createdAt: string;
    user: { name: string };
  }[];
  _count?: { reviews: number };
}

// Quick Info section with dynamic settings
function QuickInfoSection() {
  const { settings, formatPrice: formatSettingsPrice } = useSettings();
  const freeThreshold = parseFloat(settings.shipping.freeShippingThreshold) || 50000;
  
  return (
    <div className="grid grid-cols-2 gap-4 border-t pt-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        Free shipping over {formatSettingsPrice(freeThreshold)}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
        Easy returns
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Quality guaranteed
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        24/7 Support
      </div>
    </div>
  );
}

export default function PartDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchPart = async () => {
      try {
        const res = await fetch(`/api/parts/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          setPart(data);
        } else {
          setPart(null);
        }
      } catch (error) {
        console.error("Failed to fetch part:", error);
        setPart(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchPart();
    }
  }, [params.slug]);

  const handleAddToCart = () => {
    if (!part) return;

    addItem({
      itemType: "PART",
      productId: part.id,
      name: part.name,
      price: part.salePrice || part.price,
      quantity,
      image: part.images[0]?.url || "/placeholder.svg",
      maxStock: part.stock,
    });

    toast({
      title: "Added to cart",
      description: `${part.name} has been added to your cart.`,
    });
  };

  const averageRating = part?.reviews?.length
    ? part.reviews.reduce((sum, r) => sum + r.rating, 0) / part.reviews.length
    : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="mb-2 text-lg font-medium">Part not found</h3>
            <p className="mb-4 text-muted-foreground">
              The part you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/parts">
              <Button>Browse Parts</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/parts" className="hover:text-primary">Parts</Link>
        <span>/</span>
        <span className="text-foreground">{part.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={part.images[selectedImage]?.url || "/placeholder.svg"}
              alt={part.images[selectedImage]?.alt || part.name}
              className="h-full w-full object-contain"
            />
          </div>
          {part.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {part.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `${part.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Part Info */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {part.category && (
                <Badge variant="secondary">{part.category.name}</Badge>
              )}
              {part.brand && (
                <Badge variant="outline">{part.brand.name}</Badge>
              )}
              {part.isFeatured && (
                <Badge>Featured</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{part.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">SKU: {part.sku}</p>
          </div>

          {/* Rating */}
          {part.reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-5 w-5 ${
                      star <= averageRating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} ({part._count?.reviews || 0} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {part.salePrice ? (
              <>
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(part.salePrice)}
                </span>
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(part.price)}
                </span>
                <Badge variant="destructive">
                  {Math.round((1 - part.salePrice / part.price) * 100)}% OFF
                </Badge>
              </>
            ) : (
              <span className="text-3xl font-bold text-primary">
                {formatPrice(part.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {part.stock > 0 ? (
              <>
                <span className="flex h-3 w-3 rounded-full bg-green-500" />
                <span className="text-green-600">
                  In Stock ({part.stock} available)
                </span>
              </>
            ) : (
              <>
                <span className="flex h-3 w-3 rounded-full bg-red-500" />
                <span className="text-red-600">Out of Stock</span>
              </>
            )}
          </div>

          {/* Compatibility */}
          {part.compatibility && (
            <div>
              <h3 className="font-medium mb-1">Compatibility</h3>
              <p className="text-sm text-muted-foreground">{part.compatibility}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{part.description}</p>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-muted"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(part.stock, quantity + 1))}
                className="px-4 py-2 hover:bg-muted"
                disabled={quantity >= part.stock}
              >
                +
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={part.stock === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              Add to Cart
            </Button>
          </div>

          {/* Quick Info */}
          <QuickInfoSection />
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12">
        <Tabs defaultValue="specifications">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({part._count?.reviews || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                {part.specifications && Object.keys(part.specifications).length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries(part.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specifications available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                {part.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {part.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating ? "text-yellow-400" : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="font-medium">{review.user.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="mt-2 font-medium">{review.title}</h4>
                        )}
                        <p className="mt-1 text-muted-foreground">{review.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reviews yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Be the first to review this part.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
