"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface WishlistItem {
  _id: string;
  itemType: "GENERATOR" | "PART";
  generatorId?: string;
  partId?: string;
  generator?: {
    name: string;
    slug: string;
    price: number;
    images: { url: string; alt?: string }[];
    stock: number;
  };
  part?: {
    name: string;
    slug: string;
    price: number;
    images: { url: string; alt?: string }[];
    stock: number;
  };
  createdAt: string;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/user/wishlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: string) => {
      try {
          const res = await fetch(`/api/user/wishlist?id=${id}`, {
              method: 'DELETE',
          });
          
          if (res.ok) {
              setItems(items.filter(item => item._id !== id));
              toast({
                  title: "Removed",
                  description: "Item removed from your wishlist",
              });
          }
      } catch (error) {
          toast({
              title: "Error",
              description: "Failed to remove item",
              variant: "destructive",
          });
      }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground">
          View and manage items you've saved for later
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-slate-50">
           <h3 className="text-lg font-medium text-slate-900">Your wishlist is empty</h3>
           <p className="text-slate-500 mt-1">Browse our products and add items to your wishlist.</p>
           <div className="mt-6 space-x-4">
              <Button asChild>
                  <Link href="/generators">Browse Generators</Link>
              </Button>
               <Button asChild variant="outline">
                  <Link href="/parts">Browse Parts</Link>
              </Button>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
                 const product = item.itemType === 'GENERATOR' ? item.generator : item.part;
                 if (!product) return null;

                 const href = item.itemType === 'GENERATOR' 
                    ? `/generators/${product.slug}` 
                    : `/parts/${product.slug}`;
                 
                 const image = product.images?.[0]?.url || '/placeholder.png';

                 return (
                    <Card key={item._id} className="overflow-hidden flex flex-col">
                        <div className="relative h-48 w-full bg-slate-100">
                             <Image 
                                src={image} 
                                alt={product.name} 
                                fill 
                                className="object-cover" 
                             />
                        </div>
                        <CardHeader>
                            <CardTitle className="line-clamp-1 text-lg">
                                <Link href={href} className="hover:underline">
                                    {product.name}
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-xl font-bold text-primary">
                                {formatPrice(product.price)}
                            </p>
                             <p className={`text-sm mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                             </p>
                        </CardContent>
                        <CardFooter className="gap-2">
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => removeFromWishlist(item._id)}
                             >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                             </Button>
                              <Button 
                                size="sm" 
                                className="flex-1" 
                                asChild
                              >
                                  <Link href={href}>
                                    View Item
                                  </Link>
                             </Button>
                        </CardFooter>
                    </Card>
                 );
            })}
        </div>
      )}
    </div>
  );
}
