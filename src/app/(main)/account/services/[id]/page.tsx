"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface ServiceDetail {
  id: string;
  requestNumber: string;
  serviceType: string;
  status: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  serviceAddress: string;
  serviceCity: string;
  serviceState: string;
  generatorBrand?: string;
  generatorModel?: string;
  generatorSerial?: string;
  problemTitle: string;
  problemDescription: string;
  preferredDate?: string;
  estimatedCost?: number;
  finalCost?: number;
  scheduledDate?: string;
  completedAt?: string;
  diagnosis?: string;
  adminNotes?: string;
  images: { url: string; description?: string }[];
  createdAt: string;
  updatedAt: string;
}

const serviceStatusSteps = [
  { status: "PENDING", label: "Pending" },
  { status: "REVIEWING", label: "Reviewing" },
  { status: "QUOTED", label: "Quoted" },
  { status: "QUOTE_SENT", label: "Quote Sent" },
  { status: "APPROVED", label: "Approved" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "COMPLETED", label: "Completed" },
];

export default function ServiceDetailPage() {
  const params = useParams();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setService(data);
        }
      } catch (error) {
        console.error("Failed to fetch service:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PENDING: { variant: "outline" },
      REVIEWING: { variant: "secondary" },
      QUOTED: { variant: "secondary" },
      QUOTE_SENT: { variant: "secondary" },
      APPROVED: { variant: "default" },
      IN_PROGRESS: { variant: "default" },
      COMPLETED: { variant: "default" },
      CANCELLED: { variant: "destructive" },
    };
    return <Badge variant={statusConfig[status]?.variant || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      REPAIR: "Repair Service",
      MAINTENANCE: "Maintenance",
      INSTALLATION: "Installation",
      INSPECTION: "Inspection",
      EMERGENCY: "Emergency Service",
      OTHER: "Other Service",
    };
    return labels[type] || type;
  };

  const getCurrentStep = () => {
    if (service?.status === "CANCELLED") return -1;
    return serviceStatusSteps.findIndex((step) => step.status === service?.status);
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!service) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="mb-2 text-lg font-medium">Service request not found</h3>
          <Link href="/account/services">
            <Button>Back to Services</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/account/services" className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Services
          </Link>
          <h1 className="text-3xl font-bold">Request #{service.requestNumber}</h1>
          <p className="text-muted-foreground">
            Submitted on {formatDate(service.createdAt)}
          </p>
        </div>
        {getStatusBadge(service.status)}
      </div>

      {/* Status Progress */}
      {service.status !== "CANCELLED" && (
        <Card>
          <CardHeader>
            <CardTitle>Request Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto pb-2">
              <div className="flex justify-between min-w-[600px]">
                {serviceStatusSteps.map((step, index) => (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        index <= currentStep
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground"
                      }`}
                    >
                      {index < currentStep ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className={`mt-2 text-xs text-center ${index <= currentStep ? "font-medium text-primary" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled Notice */}
      {service.status === "CANCELLED" && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
              <div>
                <p className="font-medium">Request Cancelled</p>
                <p className="text-sm opacity-80">This service request has been cancelled.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Service Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <p className="font-medium">{getServiceTypeLabel(service.serviceType)}</p>
                </div>
                {service.preferredDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Preferred Date</p>
                    <p className="font-medium">
                      {formatDate(service.preferredDate)}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Problem Title</p>
                <p className="font-medium">{service.problemTitle}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Problem Description</p>
                <p className="text-muted-foreground">{service.problemDescription}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generator Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact & Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Name</p>
                  <p className="font-medium">{service.contactName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{service.contactPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{service.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{service.serviceCity}, {service.serviceState}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{service.serviceAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          {service.images && service.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {service.images.map((image, index) => (
                    <div key={index} className="aspect-video overflow-hidden rounded-lg border">
                      <img
                        src={image.url}
                        alt={image.description || `Issue image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quote */}
          {service.estimatedCost && (
            <Card>
              <CardHeader>
                <CardTitle>Estimated Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  PKR {service.estimatedCost.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Final cost may vary based on actual work required
                </p>
              </CardContent>
            </Card>
          )}

          {/* Scheduled Date */}
          {service.scheduledDate && (
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{formatDate(service.scheduledDate)}</p>
                    <p className="text-sm text-muted-foreground">Service appointment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Notes */}
          {service.adminNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes from Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.adminNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button className="w-full" variant="outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Contact Support
              </Button>
              {service.status === "PENDING" && (
                <Button className="w-full" variant="destructive">
                  Cancel Request
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <div className="h-full w-px bg-border" />
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Request Submitted</p>
                    <p className="text-sm text-muted-foreground">{formatDate(service.createdAt)}</p>
                  </div>
                </div>
                {service.updatedAt !== service.createdAt && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">{formatDate(service.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
