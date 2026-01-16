"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function StaffServiceDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user && (session.user.role === "ADMIN" || session.user.role === "STAFF") && params.id) {
      fetchService();
    }
  }, [session, status, params.id]);

  const fetchService = async () => {
    try {
      const res = await fetch(`/api/admin/services/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Staff - Service data received:', data.service);
        console.log('Staff - Images array:', data.service?.images);
        console.log('Staff - Images length:', data.service?.images?.length);
        setService(data.service);
        setInternalNotes(data.service.internalNotes || "");
        setQuotedPrice(data.service.quotedPrice?.toString() || "");
      } else {
        toast({
          title: "Error",
          description: "Service not found",
          variant: "destructive",
        });
        router.push("/staff/services");
      }
    } catch (error) {
      console.error("Error fetching service:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (updates: any) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/services/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        toast({
          title: "Service Updated",
          description: "Service request has been updated",
        });
        fetchService();
      } else {
        throw new Error("Failed to update service");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      REVIEWING: "default",
      QUOTED: "default",
      QUOTE_SENT: "default",
      APPROVED: "default",
      IN_PROGRESS: "default",
      COMPLETED: "default",
      CANCELLED: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace(/_/g, " ")}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-green-100 text-green-800",
      NORMAL: "bg-blue-100 text-blue-800",
      HIGH: "bg-yellow-100 text-yellow-800",
      URGENT: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={colors[priority] || "bg-gray-100 text-gray-800"}>
        {priority}
      </Badge>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading service...</p>
        </div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link
          href="/staff/services"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Services
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{service.problemTitle || service.serviceType}</h1>
            <p className="text-muted-foreground">
              Submitted on {new Date(service.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">{service.serviceType?.replace(/_/g, " ")}</Badge>
            {getPriorityBadge(service.priority || "NORMAL")}
            {getStatusBadge(service.status)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Details */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Problem Description</Label>
                  <p className="mt-1">{service.problemDescription}</p>
                </div>
                {service.generatorBrand && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label className="text-muted-foreground">Generator Brand</Label>
                      <p className="mt-1">{service.generatorBrand}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Model</Label>
                      <p className="mt-1">{service.generatorModel || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Serial</Label>
                      <p className="mt-1">{service.generatorSerial || "-"}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle>Attached Images ({service.images?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {service.images && Array.isArray(service.images) && service.images.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {service.images.map((img: any, index: number) => {
                    const CLOUDINARY_CLOUD_NAME = "drmqggyb9";
                    let imageUrl = img.url || img.secure_url || img.path || "";
                    
                    // If URL looks like just a public_id, construct full URL
                    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                      imageUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${imageUrl}`;
                    }
                    
                    return (
                      <div key={index} className="aspect-video overflow-hidden rounded-lg border bg-muted">
                        <img
                          src={imageUrl || '/placeholder.svg'}
                          alt={`Service image ${index + 1}`}
                          className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => imageUrl && window.open(imageUrl, '_blank')}
                          onError={(e) => {
                            console.error('Image load error:', imageUrl);
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-muted-foreground">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    No images attached to this service request
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select
                    value={service.status}
                    onValueChange={(v) => updateService({ status: v })}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="REVIEWING">Reviewing</SelectItem>
                      <SelectItem value="QUOTED">Quoted</SelectItem>
                      <SelectItem value="QUOTE_SENT">Quote Sent</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={service.priority || "NORMAL"}
                    onValueChange={(v) => updateService({ priority: v })}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="NORMAL">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          Normal
                        </div>
                      </SelectItem>
                      <SelectItem value="HIGH">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-yellow-500" />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="URGENT">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          Urgent
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <Label>Quoted Price (PKR)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={quotedPrice}
                      onChange={(e) => setQuotedPrice(e.target.value)}
                      placeholder="Enter quote amount"
                    />
                    <Button
                      onClick={() => updateService({ quotedPrice: parseFloat(quotedPrice) })}
                      disabled={updating || !quotedPrice}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Internal Notes (not visible to customer)</Label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={4}
                  placeholder="Add internal notes..."
                />
                <Button
                  onClick={() => updateService({ internalNotes })}
                  disabled={updating}
                  className="mt-2"
                >
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{service.contactName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p>
                    <a href={`tel:${service.contactPhone}`} className="text-primary hover:underline">
                      {service.contactPhone}
                    </a>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>
                    <a href={`mailto:${service.contactEmail}`} className="text-primary hover:underline">
                      {service.contactEmail}
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Address */}
          <Card>
            <CardHeader>
              <CardTitle>Service Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p>{service.serviceAddress}</p>
                <p>{service.serviceCity}, {service.serviceState}</p>
              </div>
            </CardContent>
          </Card>

          {/* Preferred Schedule */}
          {service.preferredDate && (
            <Card>
              <CardHeader>
                <CardTitle>Preferred Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p>{new Date(service.preferredDate).toLocaleDateString()}</p>
                  </div>
                  {service.preferredTime && (
                    <div>
                      <Label className="text-muted-foreground">Time</Label>
                      <p>{service.preferredTime}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quote Info */}
          {service.quotedPrice && (
            <Card>
              <CardHeader>
                <CardTitle>Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  PKR {service.quotedPrice.toLocaleString()}
                </div>
                {service.quotedAt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Quoted on {new Date(service.quotedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
