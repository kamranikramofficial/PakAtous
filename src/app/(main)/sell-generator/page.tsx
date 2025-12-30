"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const conditions = [
  { value: "NEW", label: "Brand New (Unused)" },
  { value: "LIKE_NEW", label: "Like New (Barely Used)" },
  { value: "EXCELLENT", label: "Excellent Condition" },
  { value: "GOOD", label: "Good Condition" },
  { value: "FAIR", label: "Fair Condition" },
  { value: "NEEDS_REPAIR", label: "Needs Repair" },
];

const fuelTypes = [
  { value: "Petrol", label: "Petrol" },
  { value: "Diesel", label: "Diesel" },
  { value: "Gas", label: "Gas/LPG" },
  { value: "Dual Fuel", label: "Dual Fuel" },
];

export default function SellGeneratorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    generatorModel: "",
    year: "",
    condition: "",
    power: "",
    fuelType: "",
    engineType: "",
    runningHours: "",
    serialNumber: "",
    askingPrice: "",
    negotiable: true,
    description: "",
    reasonForSelling: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    contactCity: "",
    contactAddress: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/sell-generator");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchListings();
      // Pre-fill contact info from user profile
      setFormData(prev => ({
        ...prev,
        contactName: session.user.name || "",
        contactEmail: session.user.email || "",
      }));
    }
  }, [session]);

  const fetchListings = async () => {
    try {
      const res = await fetch("/api/user/generators");
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const addImage = () => {
    if (!newImageUrl) return;
    setImages([
      ...images,
      { url: newImageUrl, isPrimary: images.length === 0 },
    ]);
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.askingPrice || isNaN(parseFloat(formData.askingPrice))) {
      toast({
        title: "Error",
        description: "Please enter a valid asking price",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.condition) {
      toast({
        title: "Error",
        description: "Please select the condition",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.description || formData.description.length < 10) {
      toast({
        title: "Error",
        description: "Description must be at least 10 characters",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.title || formData.title.length < 5) {
      toast({
        title: "Error",
        description: "Title must be at least 5 characters",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("/api/user/generators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: formData.year ? parseInt(formData.year) : null,
          runningHours: formData.runningHours ? parseInt(formData.runningHours) : null,
          askingPrice: parseFloat(formData.askingPrice),
          images,
        }),
      });

      if (res.ok) {
        toast({
          title: "Listing Submitted!",
          description: "Your generator listing has been submitted for review. Our team will contact you soon.",
        });
        setShowForm(false);
        setFormData({
          title: "",
          brand: "",
          generatorModel: "",
          year: "",
          condition: "",
          power: "",
          fuelType: "",
          engineType: "",
          runningHours: "",
          serialNumber: "",
          askingPrice: "",
          negotiable: true,
          description: "",
          reasonForSelling: "",
          contactName: session?.user?.name || "",
          contactPhone: "",
          contactEmail: session?.user?.email || "",
          contactCity: "",
          contactAddress: "",
        });
        setImages([]);
        fetchListings();
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit listing");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit listing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      PENDING: { variant: "secondary", label: "Under Review" },
      APPROVED: { variant: "default", label: "Approved" },
      REJECTED: { variant: "destructive", label: "Rejected" },
      SOLD: { variant: "default", label: "Sold" },
      EXPIRED: { variant: "outline", label: "Expired" },
    };
    const { variant, label } = config[status] || { variant: "outline", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (status === "loading") {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Sell Your Generator</h1>
          <p className="text-muted-foreground mt-2">
            List your generator for sale. Our team will review your listing and contact you for purchase.
          </p>
        </div>

        {/* Existing Listings */}
        {listings.length > 0 && !showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div
                    key={listing._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-medium">{listing.title}</p>
                        {getStatusBadge(listing.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {listing.brand} {listing.model} • PKR {listing.askingPrice?.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                      {listing.status === "REJECTED" && listing.rejectionReason && (
                        <p className="text-sm text-destructive mt-1">
                          Reason: {listing.rejectionReason}
                        </p>
                      )}
                      {listing.status === "SOLD" && listing.purchasedPrice && (
                        <p className="text-sm text-green-600 mt-1">
                          Sold for: PKR {listing.purchasedPrice?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Listing Button */}
        {!showForm && (
          <div className="text-center">
            <Button size="lg" onClick={() => setShowForm(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              List New Generator for Sale
            </Button>
          </div>
        )}

        {/* Listing Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Generator Details */}
            <Card>
              <CardHeader>
                <CardTitle>Generator Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Honda 5KVA Generator - Excellent Condition"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      placeholder="e.g., Honda, Yamaha, Jasco"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="generatorModel">Model *</Label>
                    <Input
                      id="generatorModel"
                      placeholder="e.g., EU3000i"
                      value={formData.generatorModel}
                      onChange={(e) => setFormData({ ...formData, generatorModel: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year of Purchase</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="e.g., 2022"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(v) => setFormData({ ...formData, condition: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="runningHours">Running Hours</Label>
                    <Input
                      id="runningHours"
                      type="number"
                      placeholder="e.g., 500"
                      min="0"
                      value={formData.runningHours}
                      onChange={(e) => setFormData({ ...formData, runningHours: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="power">Power Output</Label>
                    <Input
                      id="power"
                      placeholder="e.g., 5 KVA / 3000W"
                      value={formData.power}
                      onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select
                      value={formData.fuelType}
                      onValueChange={(v) => setFormData({ ...formData, fuelType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="engineType">Engine Type</Label>
                    <Input
                      id="engineType"
                      placeholder="e.g., 4-Stroke, Air Cooled"
                      value={formData.engineType}
                      onChange={(e) => setFormData({ ...formData, engineType: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      placeholder="Generator serial number"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="askingPrice">Asking Price (PKR) *</Label>
                    <Input
                      id="askingPrice"
                      type="number"
                      placeholder="e.g., 150000"
                      min="0"
                      value={formData.askingPrice}
                      onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price Negotiable?</Label>
                    <Select
                      value={formData.negotiable ? "yes" : "no"}
                      onValueChange={(v) => setFormData({ ...formData, negotiable: v === "yes" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes, negotiable</SelectItem>
                        <SelectItem value="no">Fixed price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your generator in detail - its condition, any repairs done, accessories included, etc."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reasonForSelling">Reason for Selling</Label>
                  <Input
                    id="reasonForSelling"
                    placeholder="e.g., Upgrading to larger unit"
                    value={formData.reasonForSelling}
                    onChange={(e) => setFormData({ ...formData, reasonForSelling: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  <Button type="button" onClick={addImage} variant="outline">
                    Add
                  </Button>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.url}
                          alt={`Image ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border"
                        />
                        {img.isPrimary && (
                          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Add clear photos of your generator from multiple angles. First image will be the primary image.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Your Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="03XX-XXXXXXX"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactCity">City *</Label>
                    <Input
                      id="contactCity"
                      placeholder="e.g., Karachi, Lahore"
                      value={formData.contactCity}
                      onChange={(e) => setFormData({ ...formData, contactCity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactAddress">Address (Optional)</Label>
                  <Input
                    id="contactAddress"
                    placeholder="Your address for pickup/inspection"
                    value={formData.contactAddress}
                    onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} size="lg">
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Listing"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
