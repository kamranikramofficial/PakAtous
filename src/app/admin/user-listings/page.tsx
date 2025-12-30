"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface UserListing {
  _id: string;
  title: string;
  brand: string;
  generatorModel: string;
  year?: number;
  condition: string;
  power?: string;
  fuelType?: string;
  runningHours?: number;
  askingPrice: number;
  negotiable: boolean;
  description: string;
  reasonForSelling?: string;
  images: { url: string; isPrimary: boolean }[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactCity: string;
  contactAddress?: string;
  status: string;
  adminNotes?: string;
  rejectionReason?: string;
  purchasedPrice?: number;
  user?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminUserListingsPage() {
  const { toast } = useToast();
  const [listings, setListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Dialog states
  const [selectedListing, setSelectedListing] = useState<UserListing | null>(null);
  const [actionType, setActionType] = useState<"view" | "approve" | "reject" | "purchase" | null>(null);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/user-generators?${params}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, statusFilter]);

  const handleAction = async () => {
    if (!selectedListing || !actionType) return;
    setUpdating(true);

    try {
      const updateData: any = { adminNotes };

      if (actionType === "approve") {
        updateData.status = "APPROVED";
      } else if (actionType === "reject") {
        updateData.status = "REJECTED";
        updateData.rejectionReason = rejectionReason;
      } else if (actionType === "purchase") {
        updateData.status = "SOLD";
        updateData.purchasedPrice = parseFloat(purchasePrice);
      }

      const res = await fetch(`/api/admin/user-generators/${selectedListing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: `Listing ${actionType === "purchase" ? "marked as purchased" : actionType + "d"} successfully`,
        });
        fetchListings();
        closeDialog();
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to update listing");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const closeDialog = () => {
    setSelectedListing(null);
    setActionType(null);
    setPurchasePrice("");
    setRejectionReason("");
    setAdminNotes("");
  };

  const openAction = (listing: UserListing, type: "view" | "approve" | "reject" | "purchase") => {
    setSelectedListing(listing);
    setActionType(type);
    setAdminNotes(listing.adminNotes || "");
    if (type === "purchase") {
      setPurchasePrice(listing.askingPrice.toString());
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      PENDING: { variant: "secondary", label: "Pending Review" },
      APPROVED: { variant: "default", label: "Approved" },
      REJECTED: { variant: "destructive", label: "Rejected" },
      SOLD: { variant: "default", label: "Purchased" },
      EXPIRED: { variant: "outline", label: "Expired" },
    };
    const { variant, label } = config[status] || { variant: "outline", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      NEW: "Brand New",
      LIKE_NEW: "Like New",
      EXCELLENT: "Excellent",
      GOOD: "Good",
      FAIR: "Fair",
      NEEDS_REPAIR: "Needs Repair",
    };
    return labels[condition] || condition;
  };

  if (loading && listings.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Generator Listings</h1>
        <p className="text-muted-foreground">
          Review and purchase generators listed by users
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="SOLD">Purchased</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Listings ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg gap-4"
                >
                  <div className="flex gap-4">
                    {listing.images?.[0] && (
                      <img
                        src={listing.images[0].url}
                        alt={listing.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-medium">{listing.title}</p>
                        {getStatusBadge(listing.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {listing.brand} {listing.generatorModel} • {getConditionLabel(listing.condition)}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        PKR {listing.askingPrice.toLocaleString()}
                        {listing.negotiable && (
                          <span className="text-muted-foreground font-normal"> (Negotiable)</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {listing.contactName} • {listing.contactCity} • {listing.contactPhone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAction(listing, "view")}
                    >
                      View Details
                    </Button>
                    {listing.status === "PENDING" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openAction(listing, "approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openAction(listing, "reject")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {(listing.status === "PENDING" || listing.status === "APPROVED") && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => openAction(listing, "purchase")}
                      >
                        Purchase
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No listings found
            </p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={actionType === "view"} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedListing?.title}</DialogTitle>
            <DialogDescription>
              Listing details submitted by user
            </DialogDescription>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              {/* Images */}
              {selectedListing.images?.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedListing.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={`Image ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Details Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Brand & Model</Label>
                  <p>{selectedListing.brand} {selectedListing.generatorModel}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Condition</Label>
                  <p>{getConditionLabel(selectedListing.condition)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Year</Label>
                  <p>{selectedListing.year || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Running Hours</Label>
                  <p>{selectedListing.runningHours || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Power Output</Label>
                  <p>{selectedListing.power || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fuel Type</Label>
                  <p>{selectedListing.fuelType || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Asking Price</Label>
                  <p className="font-medium text-primary">
                    PKR {selectedListing.askingPrice.toLocaleString()}
                    {selectedListing.negotiable && " (Negotiable)"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{getStatusBadge(selectedListing.status)}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedListing.description}</p>
              </div>

              {selectedListing.reasonForSelling && (
                <div>
                  <Label className="text-muted-foreground">Reason for Selling</Label>
                  <p className="mt-1">{selectedListing.reasonForSelling}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Contact Information</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p>{selectedListing.contactName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p>
                      <a href={`tel:${selectedListing.contactPhone}`} className="text-primary">
                        {selectedListing.contactPhone}
                      </a>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>
                      <a href={`mailto:${selectedListing.contactEmail}`} className="text-primary">
                        {selectedListing.contactEmail}
                      </a>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">City</Label>
                    <p>{selectedListing.contactCity}</p>
                  </div>
                  {selectedListing.contactAddress && (
                    <div className="sm:col-span-2">
                      <Label className="text-muted-foreground">Address</Label>
                      <p>{selectedListing.contactAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={actionType === "approve"} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Listing</DialogTitle>
            <DialogDescription>
              Approve this generator listing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any internal notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={updating}>
              {updating ? "Approving..." : "Approve Listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionType === "reject"} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Reason *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this listing is being rejected..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any internal notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleAction}
              disabled={updating || !rejectionReason}
            >
              {updating ? "Rejecting..." : "Reject Listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Dialog */}
      <Dialog open={actionType === "purchase"} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Generator</DialogTitle>
            <DialogDescription>
              Mark this generator as purchased
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{selectedListing?.title}</p>
              <p className="text-sm text-muted-foreground">
                Asking Price: PKR {selectedListing?.askingPrice.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Purchase Price (PKR) *</Label>
              <Input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="Enter final purchase price"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this purchase..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAction}
              disabled={updating || !purchasePrice}
            >
              {updating ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
