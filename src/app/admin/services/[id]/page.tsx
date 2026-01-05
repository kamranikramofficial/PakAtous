"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const serviceTypes = [
  { value: "INSTALLATION", label: "Installation" },
  { value: "REPAIR", label: "Repair" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "INSPECTION", label: "Inspection" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "OTHER", label: "Other" },
];

const serviceStatuses = [
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "QUOTED", label: "Quoted" },
  { value: "QUOTE_SENT", label: "Quote Sent" },
  { value: "APPROVED", label: "Approved" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

interface ServiceRequest {
  _id: string;
  requestNumber: string;
  userId: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  serviceType: string;
  status: string;
  priority: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  serviceAddress: string;
  serviceCity: string;
  serviceState: string;
  problemTitle: string;
  problemDescription: string;
  preferredDate?: string;
  generatorBrand?: string;
  generatorModel?: string;
  generatorSerial?: string;
  estimatedCost?: number;
  finalCost?: number;
  adminNotes?: string;
  diagnosis?: string;
  scheduledDate?: string;
  completedAt?: string;
  assignedTo?: string;
  images?: { url: string; description?: string }[];
  createdAt: string;
  updatedAt: string;
}

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [service, setService] = useState<ServiceRequest | null>(null);
  
  const [formData, setFormData] = useState({
    status: "",
    priority: "",
    estimatedCost: "",
    finalCost: "",
    adminNotes: "",
    internalNotes: "",
    scheduledDate: "",
  });

  useEffect(() => {
    fetchService();
  }, [params.id]);

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/admin/services/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch service");
      const data = await response.json();
      const serviceData = data.service || data;
      console.log('Admin - Service data received:', serviceData);
      console.log('Admin - Images array:', serviceData.images);
      console.log('Admin - Images length:', serviceData.images?.length);
      setService(serviceData);
      setFormData({
        status: serviceData.status || "PENDING",
        priority: serviceData.priority || "NORMAL",
        estimatedCost: serviceData.estimatedCost?.toString() || "",
        finalCost: serviceData.finalCost?.toString() || "",
        adminNotes: serviceData.adminNotes || "",
        internalNotes: serviceData.internalNotes || "",
        scheduledDate: serviceData.scheduledDate ? new Date(serviceData.scheduledDate).toISOString().split("T")[0] : "",
      });
    } catch (error) {
      console.error("Error fetching service:", error);
      toast({
        title: "Error",
        description: "Failed to load service details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        status: formData.status,
        priority: formData.priority || undefined,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
        actualCost: formData.finalCost ? parseFloat(formData.finalCost) : undefined,
        adminNotes: formData.adminNotes || undefined,
        internalNotes: formData.internalNotes,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
      };

      const response = await fetch(`/api/admin/services/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update service");
      }

      toast({
        title: "Success",
        description: "Service request updated successfully",
      });

      router.push("/admin/services");
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update service",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Service request not found</p>
            <Link href="/admin/services">
              <Button className="mt-4">Back to Services</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "QUOTED": return "bg-blue-100 text-blue-800";
      case "APPROVED": return "bg-indigo-100 text-indigo-800";
      case "IN_PROGRESS": return "bg-purple-100 text-purple-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/services" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Service Request</h1>
          <p className="text-muted-foreground">ID: {service._id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
          {service.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Service Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{service.contactName || service.user?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{service.contactEmail || service.user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{service.contactPhone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{service.serviceAddress}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{service.serviceCity}, {service.serviceState}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Request Number</p>
                <p className="font-medium">{service.requestNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">
                  {serviceTypes.find(t => t.value === service.serviceType)?.label || service.serviceType}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <p className="font-medium">{service.priority || "NORMAL"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Problem Title</p>
                <p className="font-medium">{service.problemTitle}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{service.problemDescription}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preferred Date</p>
                <p className="font-medium">
                  {service.preferredDate ? new Date(service.preferredDate).toLocaleDateString() : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium">{new Date(service.createdAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {(service.generatorBrand || service.generatorModel || service.generatorSerial) && (
            <Card>
              <CardHeader>
                <CardTitle>Generator Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.generatorBrand && (
                  <div>
                    <p className="text-sm text-muted-foreground">Brand</p>
                    <p className="font-medium">{service.generatorBrand}</p>
                  </div>
                )}
                {service.generatorModel && (
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-medium">{service.generatorModel}</p>
                  </div>
                )}
                {service.generatorSerial && (
                  <div>
                    <p className="text-sm text-muted-foreground">Serial Number</p>
                    <p className="font-medium">{service.generatorSerial}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Attached Images Section */}
          <Card>
            <CardHeader>
              <CardTitle>Attached Images ({service.images?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {service.images && Array.isArray(service.images) && service.images.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {service.images.map((img: any, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
                        <img
                          src={img.url}
                          alt={img.description || `Service image ${index + 1}`}
                          className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(img.url, '_blank')}
                          onError={(e) => {
                            console.error('Image load error:', img.url);
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      {img.description && (
                        <p className="text-xs text-muted-foreground px-1">
                          {img.description}
                        </p>
                      )}
                    </div>
                  ))}
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
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Update Service Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedCost">Estimated Cost (PKR)</Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      placeholder="Enter estimated cost"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Provide quote for customer approval</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="finalCost">Final Cost (PKR)</Label>
                    <Input
                      id="finalCost"
                      type="number"
                      placeholder="Enter final cost"
                      value={formData.finalCost}
                      onChange={(e) => setFormData({ ...formData, finalCost: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Final cost after service completion</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Enter notes about the service, findings, work done, etc."
                    value={formData.adminNotes}
                    onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internalNotes">Internal Notes (Staff Communication)</Label>
                  <Textarea
                    id="internalNotes"
                    placeholder="Add notes for staff communication. Staff will be notified via email when you add notes here."
                    value={formData.internalNotes}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    These notes are for internal team communication only. Staff members will receive email notifications.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Service
                  </Button>
                  <Link href="/admin/services">
                    <Button type="button" variant="outline">Cancel</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Status Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {serviceStatuses.map((status, index) => (
                  <div key={status.value} className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      status.value === formData.status 
                        ? getStatusColor(status.value) 
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {status.label}
                    </span>
                    {index < serviceStatuses.length - 1 && (
                      <span className="mx-2 text-gray-300">→</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Typical workflow: Pending → Quoted → Approved → In Progress → Completed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
