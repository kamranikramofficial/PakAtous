"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

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

export default function EditGeneratorPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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

  useEffect(() => {
    fetchGenerator();
  }, [params.id]);

  const fetchGenerator = async () => {
    try {
      const res = await fetch(`/api/admin/generators/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch generator");
      
      const data = await res.json();
      const generator = data.generator;
      
      reset({
        name: generator.name || "",
        slug: generator.slug || "",
        description: generator.description || "",
        shortDescription: generator.shortDescription || "",
        brand: generator.brand || "",
        modelName: generator.modelName || "",
        sku: generator.sku || "",
        price: generator.price || 0,
        compareAtPrice: generator.compareAtPrice || null,
        costPrice: generator.costPrice || null,
        stock: generator.stock || 0,
        lowStockThreshold: generator.lowStockThreshold || 5,
        powerKva: generator.powerKva || 0,
        powerKw: generator.powerKw || 0,
        voltage: generator.voltage || "",
        fuelType: generator.fuelType || "DIESEL",
        engineBrand: generator.engineBrand || "",
        alternatorBrand: generator.alternatorBrand || "",
        startingSystem: generator.startingSystem || "",
        fuelConsumption: generator.fuelConsumption || "",
        frequency: generator.frequency || "",
        phase: generator.phase || "",
        tankCapacity: generator.tankCapacity || null,
        runtime: generator.runtime || "",
        noiseLevel: generator.noiseLevel || "",
        weight: generator.weight || null,
        dimensions: generator.dimensions || "",
        warranty: generator.warranty || "",
        condition: generator.condition || "NEW",
        isActive: generator.isActive ?? true,
        isFeatured: generator.isFeatured ?? false,
      });
      
      setImageUrls(generator.images?.map((img: any) => img.url) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch generator details",
        variant: "destructive",
      });
      router.push("/admin/generators");
    } finally {
      setFetching(false);
    }
  };

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

  const handleImagesChange = (urls: string[]) => {
    setImageUrls(urls);
  };

  const onSubmit = async (data: GeneratorFormData) => {
    setLoading(true);

    try {
      const images = imageUrls.map((url, index) => ({
        url,
        alt: data.name || "Generator image",
        isPrimary: index === 0,
      }));

      const response = await fetch(`/api/admin/generators/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, images }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update generator");
      }

      toast({
        title: "Generator updated",
        description: "The generator has been updated successfully.",
      });
      router.push("/admin/generators");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading generator details...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Edit Generator</h1>
          <p className="text-muted-foreground">
            Update generator details
          </p>
        </div>
      </div>

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
                    placeholder="Brief description..."
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
                      placeholder="EU3000is"
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="powerKva">Power (kVA) *</Label>
                    <Input
                      id="powerKva"
                      type="number"
                      step="0.1"
                      {...register("powerKva", { valueAsNumber: true })}
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
                    />
                    {errors.powerKw && (
                      <p className="text-sm text-destructive">{errors.powerKw.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type *</Label>
                    <Select
                      value={watch("fuelType")}
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

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="voltage">Voltage</Label>
                    <Input
                      id="voltage"
                      {...register("voltage")}
                      placeholder="220V"
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
                  <div className="space-y-2">
                    <Label htmlFor="engineBrand">Engine Brand</Label>
                    <Input
                      id="engineBrand"
                      {...register("engineBrand")}
                      placeholder="Honda GX390"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <div className="space-y-2">
                    <Label htmlFor="fuelConsumption">Fuel Consumption</Label>
                    <Input
                      id="fuelConsumption"
                      {...register("fuelConsumption")}
                      placeholder="2.5L/hr at 75% load"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="tankCapacity">Fuel Tank (L)</Label>
                    <Input
                      id="tankCapacity"
                      type="number"
                      step="0.1"
                      {...register("tankCapacity", { valueAsNumber: true })}
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
                  <div className="space-y-2">
                    <Label htmlFor="noiseLevel">Noise Level</Label>
                    <Input
                      id="noiseLevel"
                      {...register("noiseLevel")}
                      placeholder="65 dB"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      {...register("weight", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      {...register("dimensions")}
                      placeholder="650 x 500 x 550 mm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warranty">Warranty</Label>
                    <Input
                      id="warranty"
                      {...register("warranty")}
                      placeholder="2 Years"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUpload
                  value={imageUrls}
                  onChange={handleImagesChange}
                  maxImages={10}
                  folder="generators"
                />
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
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (PKR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare at Price</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    {...register("compareAtPrice", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    {...register("costPrice", { valueAsNumber: true })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={watch("condition")}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="h-4 w-4"
                  />
                  <span>Active (visible on store)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("isFeatured")}
                    className="h-4 w-4"
                  />
                  <span>Featured</span>
                </label>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
