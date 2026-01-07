"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/contexts/settings-context";

interface Generator {
  id: string;
  name: string;
  slug: string;
  brand: string;
  modelName?: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  stock: number;
  powerKva: number;
  powerKw?: number;
  voltage?: string;
  fuelType: string;
  frequency?: string;
  phase?: string;
  engineBrand?: string;
  alternatorBrand?: string;
  startingSystem?: string;
  tankCapacity?: number;
  fuelConsumption?: string;
  runtime?: string;
  noiseLevel?: string;
  weight?: number;
  dimensions?: string;
  warranty?: string;
  condition: string;
  images: { id: string; url: string; alt?: string; isPrimary: boolean }[];
  reviews: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: { name: string };
  }[];
  avgRating?: number;
  _count?: { reviews: number };
}

// Generator Quick Info component with dynamic settings
function GeneratorQuickInfo() {
  const { settings, formatPrice: formatSettingsPrice } = useSettings();
  const freeThreshold = parseFloat(settings.shipping.freeShippingThreshold) || 50000;
  
  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-4 p-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <div className="text-sm">
            <p className="font-medium">Free Delivery</p>
            <p className="text-muted-foreground">On orders above {formatSettingsPrice(freeThreshold)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <div className="text-sm">
            <p className="font-medium">Genuine Product</p>
            <p className="text-muted-foreground">100% Authentic</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          <div className="text-sm">
            <p className="font-medium">Easy Returns</p>
            <p className="text-muted-foreground">7-day return policy</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          <div className="text-sm">
            <p className="font-medium">Support</p>
            <p className="text-muted-foreground">24/7 Customer Support</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GeneratorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  
  const [generator, setGenerator] = useState<Generator | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchGenerator = async () => {
      try {
        const response = await fetch(`/api/generators/${params.slug}`);
        if (!response.ok) throw new Error("Not found");
        const data = await response.json();
        setGenerator(data.generator);
      } catch (error) {
        router.push("/generators");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchGenerator();
    }
  }, [params.slug, router]);

  const handleAddToCart = async () => {
    if (!generator) return;

    setAddingToCart(true);
    try {
      // Add to local cart first
      addItem({
        itemType: "GENERATOR",
        productId: generator.id,
        name: generator.name,
        price: generator.salePrice || generator.price,
        quantity,
        image: generator.images[0]?.url || "/placeholder.svg",
        maxStock: generator.stock,
      });

      // If logged in, sync with server
      if (session?.user) {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generatorId: generator.id,
            quantity,
          }),
        });
      }

      toast({
        title: "Added to cart",
        description: `${generator.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!generator) {
    return (
      <div className="container flex h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Generator not found</h1>
        <Link href="/generators">
          <Button>Browse Generators</Button>
        </Link>
      </div>
    );
  }

  const currentPrice = generator.salePrice || generator.price;
  const discount = generator.salePrice
    ? Math.round(((generator.price - generator.salePrice) / generator.price) * 100)
    : 0;

  const specs = [
    { label: "Power Output", value: `${generator.powerKva} kVA` },
    { label: "Power (kW)", value: generator.powerKw ? `${generator.powerKw} kW` : "-" },
    { label: "Voltage", value: generator.voltage || "-" },
    { label: "Frequency", value: generator.frequency || "-" },
    { label: "Phase", value: generator.phase || "-" },
    { label: "Fuel Type", value: generator.fuelType },
    { label: "Engine Brand", value: generator.engineBrand || "-" },
    { label: "Alternator Brand", value: generator.alternatorBrand || "-" },
    { label: "Starting System", value: generator.startingSystem || "-" },
    { label: "Fuel Tank", value: generator.tankCapacity ? `${generator.tankCapacity}L` : "-" },
    { label: "Fuel Consumption", value: generator.fuelConsumption || "-" },
    { label: "Running Time", value: generator.runtime || "-" },
    { label: "Noise Level", value: generator.noiseLevel || "-" },
    { label: "Weight", value: generator.weight ? `${generator.weight} kg` : "-" },
    { label: "Dimensions", value: generator.dimensions || "-" },
    { label: "Condition", value: generator.condition },
    { label: "Warranty", value: generator.warranty || "-" },
  ];

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/generators" className="hover:text-foreground">
          Generators
        </Link>
        <span>/</span>
        <span className="text-foreground">{generator.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {generator.images[selectedImage] ? (
              <img
                src={generator.images[selectedImage].url || "/placeholder.svg"}
                alt={generator.images[selectedImage].alt || generator.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <img
                src="/placeholder.svg"
                alt="Placeholder"
                className="h-full w-full object-contain"
              />
            )}
            {discount > 0 && (
              <Badge className="absolute left-4 top-4" variant="destructive">
                {discount}% OFF
              </Badge>
            )}
          </div>
          {generator.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {generator.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 rounded-lg border-2 overflow-hidden transition-colors ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground"
                  }`}
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt || `${generator.name} ${index + 1}`}
                    className="h-20 w-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{generator.fuelType}</Badge>
              <Badge variant="secondary">{generator.powerKva} kVA</Badge>
              {generator.condition !== "NEW" && (
                <Badge>{generator.condition}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{generator.name}</h1>
            <p className="text-lg text-muted-foreground">
              {generator.brand} {generator.modelName && `• ${generator.modelName}`}
            </p>
          </div>

          {/* Rating */}
          {generator._count && generator._count.reviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={star <= (generator.avgRating || 0) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-400"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({generator._count?.reviews || 0} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(currentPrice)}
              </span>
              {generator.salePrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(generator.price)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
          </div>

          {/* Short Description */}
          {generator.shortDescription && (
            <p className="text-muted-foreground">{generator.shortDescription}</p>
          )}

          {/* Stock & Quantity */}
          <div className="space-y-4">
            {generator.stock > 0 ? (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-500"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
                <span className="text-green-600">
                  In Stock ({generator.stock} available)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
                <span>Out of Stock</span>
              </div>
            )}

            {generator.stock > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-muted"
                    disabled={quantity <= 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="px-4 py-2 border-x min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(generator.stock, quantity + 1))
                    }
                    className="px-3 py-2 hover:bg-muted"
                    disabled={quantity >= generator.stock}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  </button>
                </div>
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1"
                >
                  {addingToCart ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <GeneratorQuickInfo />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="description"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="specifications"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Specifications
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Reviews ({generator._count?.reviews || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="p-6 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: generator.description.replace(/\n/g, "<br/>") }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {specs.map((spec, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b py-3 last:border-0"
                  >
                    <span className="text-muted-foreground">{spec.label}</span>
                    <span className="font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {generator.reviews && generator.reviews.length > 0 ? (
                <div className="space-y-6">
                  {generator.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            {review.user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{review.user.name}</p>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill={star <= review.rating ? "currentColor" : "none"}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-yellow-400"
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Be the first to review this generator
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
