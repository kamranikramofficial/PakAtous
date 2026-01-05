"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const serviceReviewHighlights = [
  {
    id: "s1",
    name: "Kashif M.",
    title: "Arrived the same evening",
    rating: 5,
    body: "Called for an emergency outage, team arrived within hours and stabilized our shop power.",
  },
  {
    id: "s2",
    name: "Maria A.",
    title: "Clear diagnosis",
    rating: 4.8,
    body: "Technician shared photos and costs upfront. No surprises and the genset is smoother now.",
  },
  {
    id: "s3",
    name: "Talha R.",
    title: "Professional install",
    rating: 4.9,
    body: "New 20kVA install with proper earthing and ATS setup. Documentation and warranty provided.",
  },
];

const Star = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`h-4 w-4 ${filled ? "text-yellow-500" : "text-muted-foreground/40"}`}
    fill="currentColor"
    aria-hidden
  >
    <path d="M12 2.75l2.63 6.03 6.37.45-4.86 4.22 1.48 6.29L12 16.9l-5.62 2.84 1.48-6.29-4.86-4.22 6.37-.45z" />
  </svg>
);

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} filled={i < Math.round(rating)} />
    ))}
    <span className="text-xs font-medium text-muted-foreground">{rating.toFixed(1)}</span>
  </div>
);

const serviceRequestSchema = z.object({
  serviceType: z.enum([
    "REPAIR",
    "MAINTENANCE",
    "INSTALLATION",
    "INSPECTION",
    "EMERGENCY",
    "OTHER",
  ]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  generatorBrand: z.string().optional(),
  generatorModel: z.string().optional(),
  generatorSerial: z.string().optional(),
  problemTitle: z.string().min(5, "Problem title is required"),
  problemDescription: z.string().min(20, "Please describe the problem in detail (at least 20 characters)"),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  contactName: z.string().min(2, "Name is required"),
  contactPhone: z.string().min(10, "Valid phone number is required"),
  contactEmail: z.string().email("Valid email is required"),
  serviceAddress: z.string().min(5, "Service address is required"),
  serviceCity: z.string().min(2, "City is required"),
  serviceState: z.string().min(2, "State/Province is required"),
});

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

const serviceTypes = [
  {
    value: "REPAIR",
    label: "Repair",
    description: "Fix issues with your generator",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    value: "MAINTENANCE",
    label: "Maintenance",
    description: "Regular maintenance and servicing",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    value: "INSTALLATION",
    label: "Installation",
    description: "New generator installation",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20" />
        <path d="M2 12h20" />
        <path d="m4.93 4.93 14.14 14.14" />
        <path d="m19.07 4.93-14.14 14.14" />
      </svg>
    ),
  },
  {
    value: "INSPECTION",
    label: "Inspection",
    description: "Comprehensive generator inspection",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    value: "OTHER",
    label: "Other Services",
    description: "Other generator related services",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
  {
    value: "EMERGENCY",
    label: "Emergency Service",
    description: "24/7 emergency support",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
];

export default function ServicesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
  });

  const uploadImages = async (files: FileList) => {
    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 5 images.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'services');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();
        uploadedUrls.push(result.data.url);
      }

      setImages([...images, ...uploadedUrls]);
      toast({
        title: "Images uploaded",
        description: `${uploadedUrls.length} image(s) uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ServiceRequestFormData) => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to submit a service request.",
        variant: "destructive",
      });
      router.push("/auth/login?callbackUrl=/services");
      return;
    }

    setLoading(true);
    try {
      // Debug: Log what we're sending
      console.log('Submitting service request with images:', images);
      console.log('Form data:', data);
      
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, images }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit service request");
      }

      toast({
        title: "Service Request Submitted",
        description: `Your request #${result.serviceRequest.requestNumber} has been submitted. We will contact you soon.`,
      });

      router.push(`/account/services/${result.serviceRequest.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Generator Services</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Professional generator repair, maintenance, and installation services.
          Our certified technicians are ready to help you keep your power running.
        </p>
      </div>

      <div className="mb-10">
        <Card className="border-primary/10 bg-primary/5">
          <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Feedback & support</p>
              <h2 className="text-xl font-bold">Tell us the issue and we will respond quickly</h2>
              <p className="text-sm text-muted-foreground">
                Share symptoms or photos; we reply fast so you avoid downtime.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/contact">Send feedback</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/faq">View FAQs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Types */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">Our Services</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceTypes.map((service) => (
            <Card
              key={service.value}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedService === service.value
                  ? "border-primary ring-2 ring-primary"
                  : ""
              }`}
              onClick={() => {
                setSelectedService(service.value);
                setValue("serviceType", service.value as any);
              }}
            >
              <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{service.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Request Form */}
      {selectedService && (
        <Card>
          <CardHeader>
            <CardTitle>Request Service</CardTitle>
            <p className="text-muted-foreground">
              Fill out the form below and our team will contact you within 24 hours.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <input type="hidden" {...register("serviceType")} value={selectedService} />

              <div className="grid gap-6 md:grid-cols-2">
                {/* Generator Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Generator Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="generatorBrand">Generator Brand (Optional)</Label>
                    <Input
                      id="generatorBrand"
                      {...register("generatorBrand")}
                      placeholder="e.g., Honda, Caterpillar, Cummins"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="generatorModel">Model (Optional)</Label>
                    <Input
                      id="generatorModel"
                      {...register("generatorModel")}
                      placeholder="e.g., EG5000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="generatorSerial">Serial Number (Optional)</Label>
                    <Input
                      id="generatorSerial"
                      {...register("generatorSerial")}
                      placeholder="Generator serial number"
                    />
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Contact & Location</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Your Name *</Label>
                    <Input
                      id="contactName"
                      {...register("contactName")}
                      placeholder="Your full name"
                    />
                    {errors.contactName && (
                      <p className="text-sm text-destructive">
                        {errors.contactName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      {...register("contactEmail")}
                      placeholder="your@email.com"
                    />
                    {errors.contactEmail && (
                      <p className="text-sm text-destructive">
                        {errors.contactEmail.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      {...register("contactPhone")}
                      placeholder="03XX-XXXXXXX"
                    />
                    {errors.contactPhone && (
                      <p className="text-sm text-destructive">
                        {errors.contactPhone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceCity">City *</Label>
                    <Input
                      id="serviceCity"
                      {...register("serviceCity")}
                      placeholder="Your city"
                    />
                    {errors.serviceCity && (
                      <p className="text-sm text-destructive">
                        {errors.serviceCity.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceState">State/Province *</Label>
                    <Input
                      id="serviceState"
                      {...register("serviceState")}
                      placeholder="Punjab, Sindh, etc."
                    />
                    {errors.serviceState && (
                      <p className="text-sm text-destructive">
                        {errors.serviceState.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceAddress">Service Address *</Label>
                    <Textarea
                      id="serviceAddress"
                      {...register("serviceAddress")}
                      placeholder="Full address where service is needed"
                      rows={3}
                    />
                    {errors.serviceAddress && (
                      <p className="text-sm text-destructive">
                        {errors.serviceAddress.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Problem Title */}
              <div className="space-y-2">
                <Label htmlFor="problemTitle">Problem Title *</Label>
                <Input
                  id="problemTitle"
                  {...register("problemTitle")}
                  placeholder="Brief title describing the issue"
                />
                {errors.problemTitle && (
                  <p className="text-sm text-destructive">
                    {errors.problemTitle.message}
                  </p>
                )}
              </div>

              {/* Problem Description */}
              <div className="space-y-2">
                <Label htmlFor="problemDescription">Problem Description *</Label>
                <Textarea
                  id="problemDescription"
                  {...register("problemDescription")}
                  placeholder="Please describe the issue you're experiencing with your generator in detail..."
                  rows={5}
                />
                {errors.problemDescription && (
                  <p className="text-sm text-destructive">
                    {errors.problemDescription.message}
                  </p>
                )}
              </div>

              {/* Priority Selection */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <p className="text-sm text-muted-foreground">
                  How urgent is this service request?
                </p>
                <Select 
                  defaultValue="NORMAL"
                  onValueChange={(value) => setValue("priority", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Low - Can wait a few days
                      </div>
                    </SelectItem>
                    <SelectItem value="NORMAL">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Normal - Standard response time
                      </div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        High - Need attention soon
                      </div>
                    </SelectItem>
                    <SelectItem value="URGENT">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Urgent - Needs immediate attention
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Date/Time */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    {...register("preferredDate")}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredTime">Preferred Time</Label>
                  <Select onValueChange={(value) => setValue("preferredTime", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                      <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label htmlFor="images">Photos (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Upload photos of the issue to help our technicians understand the problem better.
                </p>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading || images.length >= 5}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      uploadImages(e.target.files);
                      e.target.value = '';
                    }
                  }}
                  className="cursor-pointer"
                />
                {uploading && (
                  <p className="text-sm text-primary">Uploading images...</p>
                )}
                {images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Issue ${index + 1}`}
                          className="h-20 w-20 rounded object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Maximum 5 images, 5MB each</p>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  {session ? (
                    "Your contact details will be taken from your account."
                  ) : (
                    <>
                      <Link href="/auth/login?callbackUrl=/services" className="text-primary hover:underline">
                        Login
                      </Link>{" "}
                      to submit a service request.
                    </>
                  )}
                </p>
                <Button type="submit" size="lg" disabled={loading || !session}>
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews and feedback */}
      <section className="mt-16 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Reviews</p>
            <h2 className="text-2xl font-bold">What service customers say</h2>
            <p className="text-sm text-muted-foreground">
              Feedback from owners who booked repairs, installs, and emergency visits.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/contact">Share your feedback</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/faq">Need help choosing a service?</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {serviceReviewHighlights.map((review) => (
            <Card key={review.id} className="h-full">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Verified service
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold">{review.title}</h3>
                  <p className="text-sm text-muted-foreground">{review.body}</p>
                </div>
                <p className="mt-auto text-sm font-medium">{review.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <div className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-bold">Why Choose Our Services?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              </div>
              <h3 className="font-semibold">Certified Technicians</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Factory-trained and certified professionals
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="font-semibold">24/7 Emergency</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Round-the-clock emergency support
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h3 className="font-semibold">Warranty Support</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                90-day service warranty on all repairs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" x2="12" y1="2" y2="22" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="font-semibold">Transparent Pricing</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No hidden charges, upfront quotes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
