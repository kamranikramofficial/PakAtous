"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";

interface ServiceRequest {
  id: string;
  requestNumber: string;
  serviceType: string;
  status: string;
  generatorBrand?: string;
  generatorModel?: string;
  problemTitle: string;
  problemDescription: string;
  estimatedCost?: number;
  finalCost?: number;
  scheduledDate?: string;
  createdAt: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  serviceCity: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);
  const [updateData, setUpdateData] = useState({
    status: "",
    estimatedCost: "",
    scheduledDate: "",
    adminNotes: "",
  });
  const [updating, setUpdating] = useState(false);

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (status !== "all") params.set("status", status);
      if (type !== "all") params.set("type", type);

      const res = await fetch(`/api/admin/services?${params.toString()}`);
      const data = await res.json();
      setServices(data.services || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, status, type]);

  const openUpdateDialog = (service: ServiceRequest) => {
    setSelectedService(service);
    setUpdateData({
      status: service.status,
      estimatedCost: service.estimatedCost?.toString() || "",
      scheduledDate: service.scheduledDate ? service.scheduledDate.split("T")[0] : "",
      adminNotes: "",
    });
  };

  const handleUpdate = async () => {
    if (!selectedService) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/services/${selectedService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: updateData.status,
          estimatedCost: updateData.estimatedCost ? parseFloat(updateData.estimatedCost) : null,
          scheduledDate: updateData.scheduledDate || null,
          adminNotes: updateData.adminNotes || null,
        }),
      });

      if (res.ok) {
        toast({
          title: "Service request updated",
          description: "The service request has been updated successfully.",
        });
        fetchServices();
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to update service request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
      setSelectedService(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PENDING: { variant: "outline" },
      REVIEWING: { variant: "secondary" },
      QUOTED: { variant: "secondary" },
      APPROVED: { variant: "default" },
      SCHEDULED: { variant: "default" },
      IN_PROGRESS: { variant: "default" },
      COMPLETED: { variant: "default" },
      CANCELLED: { variant: "destructive" },
    };
    return <Badge variant={statusConfig[status]?.variant || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      REPAIR: "Repair",
      MAINTENANCE: "Maintenance",
      INSTALLATION: "Installation",
      INSPECTION: "Inspection",
      EMERGENCY: "Emergency",
      OTHER: "Other",
    };
    return labels[type] || type;
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
        <h1 className="text-3xl font-bold">Service Requests</h1>
        <p className="text-muted-foreground">Manage customer service requests</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REVIEWING">Reviewing</SelectItem>
                <SelectItem value="QUOTED">Quoted</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="REPAIR">Repair</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="INSTALLATION">Installation</SelectItem>
                <SelectItem value="INSPECTION">Inspection</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4 text-left font-medium">Request #</th>
                  <th className="p-4 text-left font-medium">Customer</th>
                  <th className="p-4 text-left font-medium">Type</th>
                  <th className="p-4 text-left font-medium">Generator</th>                  <th className="p-4 text-left font-medium">Images</th>                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Estimated</th>
                  <th className="p-4 text-left font-medium">Date</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      No service requests found
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id} className="border-b">
                      <td className="p-4 font-medium">#{service.requestNumber}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{service.contactName}</p>
                          <p className="text-sm text-muted-foreground">{service.contactEmail}</p>
                          <p className="text-sm text-muted-foreground">{service.contactPhone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{getServiceTypeLabel(service.serviceType)}</Badge>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{service.generatorBrand || "-"}</p>
                        <p className="text-sm text-muted-foreground">{service.generatorModel || "-"}</p>
                      </td>
                      <td className="p-4">
                        {service.images && service.images.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {service.images.slice(0, 2).map((img: any, idx: number) => (
                              <img
                                key={idx}
                                src={img.url}
                                alt={`Preview ${idx + 1}`}
                                className="h-8 w-8 object-cover rounded border"
                              />
                            ))}
                            {service.images.length > 2 && (
                              <span className="text-xs text-muted-foreground ml-1">
                                +{service.images.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4">{getStatusBadge(service.status)}</td>
                      <td className="p-4">
                        {service.estimatedCost
                          ? `PKR ${service.estimatedCost.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="p-4 text-muted-foreground">{formatDate(service.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/services/${service.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUpdateDialog(service)}
                          >
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Update Dialog */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Service Request</DialogTitle>
            <DialogDescription>
              Update request #{selectedService?.requestNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={updateData.status}
                onValueChange={(value) => setUpdateData({ ...updateData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REVIEWING">Reviewing</SelectItem>
                  <SelectItem value="QUOTED">Quoted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Cost (PKR)</label>
              <Input
                type="number"
                value={updateData.estimatedCost}
                onChange={(e) => setUpdateData({ ...updateData, estimatedCost: e.target.value })}
                placeholder="Enter estimated cost"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Scheduled Date</label>
              <Input
                type="date"
                value={updateData.scheduledDate}
                onChange={(e) => setUpdateData({ ...updateData, scheduledDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                value={updateData.adminNotes}
                onChange={(e) => setUpdateData({ ...updateData, adminNotes: e.target.value })}
                placeholder="Internal notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedService(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
