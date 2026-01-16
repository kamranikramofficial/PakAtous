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
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [viewingListing, setViewingListing] = useState<any | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

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
      fetchAddresses();
      // Pre-fill contact info from user profile
      setFormData(prev => ({
        ...prev,
        contactName: session.user.name || "",
        contactEmail: session.user.email || "",
      }));
    }
  }, [session]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(data.addresses || []);
        
        // Pre-fill with default address if exists
        const defaultAddress = data.addresses?.find((addr: any) => addr.isDefault);
        if (defaultAddress) {
          setFormData(prev => ({
            ...prev,
            contactName: defaultAddress.fullName,
            contactPhone: defaultAddress.phone,
            contactCity: defaultAddress.city,
            contactAddress: defaultAddress.street,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

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

  const handleImagesChange = (urls: string[]) => {
    setImageUrls(urls);
  };

  const selectAddress = (address: any) => {
    setFormData(prev => ({
      ...prev,
      contactName: address.fullName,
      contactPhone: address.phone,
      contactCity: address.city,
      contactAddress: address.street,
    }));
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
    
    if (imageUrls.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one image",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      // Convert imageUrls to images format with primary flag
      const images = imageUrls.map((url, index) => ({
        url,
        isPrimary: index === 0,
      }));

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
        setImageUrls([]);
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingListing(listing)}
                    >
                      View Details
                    </Button>
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
                <ImageUpload
                  value={imageUrls}
                  onChange={handleImagesChange}
                  maxImages={10}
                  folder="user-listings"
                />
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

                {/* Saved Addresses Quick Select */}
                {!loadingAddresses && savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Saved Addresses</Label>
                    <div className="flex flex-wrap gap-2">
                      {savedAddresses.map((address) => (
                        <Button
                          key={address._id}
                          type="button"
                          variant={address.isDefault ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectAddress(address)}
                          className="text-xs"
                        >
                          {address.label} - {address.city}
                          {address.isDefault && " ✓"}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

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

        {/* View Details Dialog */}
        <Dialog open={!!viewingListing} onOpenChange={(open) => !open && setViewingListing(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingListing?.title}</DialogTitle>
              <DialogDescription>
                Your generator listing details
              </DialogDescription>
            </DialogHeader>
            {viewingListing && (
              <div className="space-y-4">
                {/* Images */}
                {viewingListing.images?.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Images</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {viewingListing.images.map((img: any, i: number) => (
                        <div key={i} className="relative aspect-video overflow-hidden rounded-lg border">
                          <img
                            src={img.url}
                            alt={`Image ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {img.isPrimary && (
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Brand & Model</Label>
                    <p className="font-medium">{viewingListing.brand} {viewingListing.generatorModel}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Condition</Label>
                    <p className="font-medium">{viewingListing.condition?.replace("_", " ")}</p>
                  </div>
                  {viewingListing.year && (
                    <div>
                      <Label className="text-muted-foreground">Year</Label>
                      <p className="font-medium">{viewingListing.year}</p>
                    </div>
                  )}
                  {viewingListing.runningHours && (
                    <div>
                      <Label className="text-muted-foreground">Running Hours</Label>
                      <p className="font-medium">{viewingListing.runningHours}</p>
                    </div>
                  )}
                  {viewingListing.power && (
                    <div>
                      <Label className="text-muted-foreground">Power Output</Label>
                      <p className="font-medium">{viewingListing.power}</p>
                    </div>
                  )}
                  {viewingListing.fuelType && (
                    <div>
                      <Label className="text-muted-foreground">Fuel Type</Label>
                      <p className="font-medium">{viewingListing.fuelType}</p>
                    </div>
                  )}
                  {viewingListing.engineType && (
                    <div>
                      <Label className="text-muted-foreground">Engine Type</Label>
                      <p className="font-medium">{viewingListing.engineType}</p>
                    </div>
                  )}
                  {viewingListing.serialNumber && (
                    <div>
                      <Label className="text-muted-foreground">Serial Number</Label>
                      <p className="font-medium">{viewingListing.serialNumber}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Asking Price</Label>
                    <p className="font-medium text-primary text-lg">
                      PKR {viewingListing.askingPrice?.toLocaleString()}
                      {viewingListing.negotiable && <span className="text-sm text-muted-foreground ml-1">(Negotiable)</span>}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(viewingListing.status)}</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1 text-sm">{viewingListing.description}</p>
                </div>

                {viewingListing.reasonForSelling && (
                  <div>
                    <Label className="text-muted-foreground">Reason for Selling</Label>
                    <p className="mt-1 text-sm">{viewingListing.reasonForSelling}</p>
                  </div>
                )}

                {/* Admin Notes */}
                {viewingListing.adminNotes && (
                  <div className="border-t pt-4">
                    <Label className="text-muted-foreground">Admin Notes</Label>
                    <p className="mt-1 text-sm">{viewingListing.adminNotes}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {viewingListing.status === "REJECTED" && viewingListing.rejectionReason && (
                  <div className="border-t pt-4">
                    <Label className="text-destructive">Rejection Reason</Label>
                    <p className="mt-1 text-sm text-destructive">{viewingListing.rejectionReason}</p>
                  </div>
                )}

                {/* Purchase Info */}
                {viewingListing.status === "SOLD" && viewingListing.purchasedPrice && (
                  <div className="border-t pt-4">
                    <Label className="text-green-600">Sold</Label>
                    <p className="mt-1 text-sm text-green-600">
                      Purchased for PKR {viewingListing.purchasedPrice?.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="border-t pt-4">
                  <Label className="font-medium mb-2 block">Contact Information</Label>
                  <div className="grid gap-2 sm:grid-cols-2 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Name</Label>
                      <p>{viewingListing.contactName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p>{viewingListing.contactPhone}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p>{viewingListing.contactEmail}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">City</Label>
                      <p>{viewingListing.contactCity}</p>
                    </div>
                    {viewingListing.contactAddress && (
                      <div className="sm:col-span-2">
                        <Label className="text-muted-foreground">Address</Label>
                        <p>{viewingListing.contactAddress}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Date */}
                <div className="text-xs text-muted-foreground pt-4 border-t">
                  Submitted on {new Date(viewingListing.createdAt).toLocaleString()}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
