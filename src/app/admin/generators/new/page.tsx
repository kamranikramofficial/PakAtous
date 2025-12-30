"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const generatorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  modelName: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.number().int().min(0).default(5),
  powerKva: z.number().positive("Power (kVA) must be positive"),
  powerKw: z.number().positive("Power (kW) must be positive"),
  voltage: z.string().optional(),
  fuelType: z.enum(["PETROL", "DIESEL", "GAS", "DUAL_FUEL", "NATURAL_GAS"]),
  engineBrand: z.string().optional(),
  alternatorBrand: z.string().optional(),
  startingSystem: z.string().optional(),
  fuelConsumption: z.string().optional(),
  frequency: z.string().optional(),
  phase: z.string().optional(),
  tankCapacity: z.number().positive().optional().nullable(),
  runtime: z.string().optional(),
  noiseLevel: z.string().optional(),
  weight: z.number().positive().optional().nullable(),
  dimensions: z.string().optional(),
  warranty: z.string().optional(),
  condition: z.enum(["NEW", "USED", "REFURBISHED"]).default("NEW"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

type GeneratorFormData = z.infer<typeof generatorSchema>;

export default function NewGeneratorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<{ url: string; alt: string }[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GeneratorFormData>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      stock: 0,
      lowStockThreshold: 5,
      condition: "NEW",
      fuelType: "DIESEL",
      isActive: true,
      isFeatured: false,
    },
  });

  const generateSlug = () => {
    const name = watch("name");
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      setImages([...images, { url: imageUrl, alt: watch("name") || "" }]);
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: GeneratorFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/generators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, images }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create generator");
      }

      router.push("/admin/generators");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Generator</h1>
          <p className="text-muted-foreground">
            Fill in the details to add a new generator
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Honda Generator 5kVA"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="slug"
                        {...register("slug")}
                        placeholder="honda-generator-5kva"
                      />
                      <Button type="button" variant="outline" onClick={generateSlug}>
                        Generate
                      </Button>
                    </div>
                    {errors.slug && (
                      <p className="text-sm text-destructive">{errors.slug.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Detailed description of the generator..."
                    rows={5}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    {...register("shortDescription")}
                    placeholder="Brief description for listings..."
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      {...register("brand")}
                      placeholder="Honda"
                    />
                    {errors.brand && (
                      <p className="text-sm text-destructive">{errors.brand.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelName">Model</Label>
                    <Input
                      id="modelName"
                      {...register("modelName")}
                      placeholder="EG5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      {...register("sku")}
                      placeholder="GEN-HON-5KVA"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="powerKva">Power (kVA) *</Label>
                    <Input
                      id="powerKva"
                      type="number"
                      step="0.1"
                      {...register("powerKva", { valueAsNumber: true })}
                      placeholder="5"
                    />
                    {errors.powerKva && (
                      <p className="text-sm text-destructive">{errors.powerKva.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="powerKw">Power (kW) *</Label>
                    <Input
                      id="powerKw"
                      type="number"
                      step="0.1"
                      {...register("powerKw", { valueAsNumber: true })}
                      placeholder="4"
                    />
                    {errors.powerKw && (
                      <p className="text-sm text-destructive">{errors.powerKw.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type *</Label>
                    <Select
                      defaultValue="DIESEL"
                      onValueChange={(value) => setValue("fuelType", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PETROL">Petrol</SelectItem>
                        <SelectItem value="DIESEL">Diesel</SelectItem>
                        <SelectItem value="GAS">Gas</SelectItem>
                        <SelectItem value="DUAL_FUEL">Dual Fuel</SelectItem>
                        <SelectItem value="NATURAL_GAS">Natural Gas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="voltage">Voltage</Label>
                    <Input
                      id="voltage"
                      {...register("voltage")}
                      placeholder="220V/380V"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input
                      id="frequency"
                      {...register("frequency")}
                      placeholder="50Hz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phase">Phase</Label>
                    <Input
                      id="phase"
                      {...register("phase")}
                      placeholder="Single Phase"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="engineBrand">Engine Brand</Label>
                    <Input
                      id="engineBrand"
                      {...register("engineBrand")}
                      placeholder="Honda, Cummins"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternatorBrand">Alternator Brand</Label>
                    <Input
                      id="alternatorBrand"
                      {...register("alternatorBrand")}
                      placeholder="Stamford, Leroy Somer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startingSystem">Starting System</Label>
                    <Input
                      id="startingSystem"
                      {...register("startingSystem")}
                      placeholder="Electric Start, Recoil Start"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="tankCapacity">Fuel Tank (Liters)</Label>
                    <Input
                      id="tankCapacity"
                      type="number"
                      step="0.1"
                      {...register("tankCapacity", { valueAsNumber: true })}
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuelConsumption">Fuel Consumption</Label>
                    <Input
                      id="fuelConsumption"
                      {...register("fuelConsumption")}
                      placeholder="2.5L/hr at 75% load"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="runtime">Running Time</Label>
                    <Input
                      id="runtime"
                      {...register("runtime")}
                      placeholder="8-10 hours"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="noiseLevel">Noise Level (dB)</Label>
                    <Input
                      id="noiseLevel"
                      {...register("noiseLevel")}
                      placeholder="72dB"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      {...register("weight", { valueAsNumber: true })}
                      placeholder="85"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions (L x W x H)</Label>
                    <Input
                      id="dimensions"
                      {...register("dimensions")}
                      placeholder="670 x 510 x 550 mm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="warranty">Warranty</Label>
                    <Input
                      id="warranty"
                      {...register("warranty")}
                      placeholder="1 Year Manufacturer Warranty"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select
                      defaultValue="NEW"
                      onValueChange={(value) => setValue("condition", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="REFURBISHED">Refurbished</SelectItem>
                        <SelectItem value="USED">Used</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addImage}>
                    Add Image
                  </Button>
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="h-24 w-full rounded object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 rounded bg-primary px-1 text-xs text-white">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  The first image will be used as the primary image.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (PKR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="250000"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare At Price (PKR)</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    {...register("compareAtPrice", { valueAsNumber: true })}
                    placeholder="280000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price (PKR)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    {...register("costPrice", { valueAsNumber: true })}
                    placeholder="180000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      {...register("stock", { valueAsNumber: true })}
                      placeholder="10"
                    />
                    {errors.stock && (
                      <p className="text-sm text-destructive">{errors.stock.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      {...register("lowStockThreshold", { valueAsNumber: true })}
                      placeholder="5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    defaultValue="NEW"
                    onValueChange={(value) => setValue("condition", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="USED">Used</SelectItem>
                      <SelectItem value="REFURBISHED">Refurbished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register("isActive")}
                    className="h-4 w-4 rounded border-gray-300"
                    defaultChecked
                  />
                  <Label htmlFor="isActive" className="text-sm font-normal">
                    Active (visible on site)
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    {...register("isFeatured")}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isFeatured" className="text-sm font-normal">
                    Featured (show on homepage)
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                "Create Generator"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
