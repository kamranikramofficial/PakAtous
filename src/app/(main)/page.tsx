import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Shield, Truck, Headphones, Wrench, Package, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dbConnect from "@/lib/prisma";
import { Generator, GeneratorImage } from "@/models/Generator";
import { Part, PartImage } from "@/models/Part";
import { Brand } from "@/models/Brand";
import { formatPrice } from "@/lib/utils";
import { FeaturesSection } from "@/components/home/features-section";
import { CTASection } from "./page-cta";

async function getFeaturedGenerators() {
  await dbConnect();
  const generators = await Generator.find({ isActive: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();
  
  const genIds = generators.map((g: any) => g._id);
  const images = await GeneratorImage.find({ 
    generatorId: { $in: genIds }, 
    isPrimary: true 
  }).lean();
  
  const imageMap = new Map(images.map((img: any) => [img.generatorId.toString(), img]));
  
  return generators.map((g: any) => ({
    ...g,
    id: g._id.toString(),
    images: imageMap.has(g._id.toString()) ? [imageMap.get(g._id.toString())] : [],
  }));
}

async function getFeaturedParts() {
  await dbConnect();
  const parts = await Part.find({ isActive: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();
  
  const partIds = parts.map((p: any) => p._id);
  const images = await PartImage.find({ 
    partId: { $in: partIds }, 
    isPrimary: true 
  }).lean();
  
  const imageMap = new Map(images.map((img: any) => [img.partId.toString(), img]));
  
  return parts.map((p: any) => ({
    ...p,
    id: p._id.toString(),
    images: imageMap.has(p._id.toString()) ? [imageMap.get(p._id.toString())] : [],
  }));
}

async function getBrands() {
  await dbConnect();
  const brands = await Brand.find({ isActive: true })
    .sort({ sortOrder: 1 })
    .limit(6)
    .lean();
  
  return brands.map((b: any) => ({ ...b, id: b._id.toString() }));
}

const services = [
  {
    title: "Generator Repair",
    description: "Expert diagnosis and repair for all generator brands.",
    icon: Wrench,
    href: "/services?type=REPAIR",
  },
  {
    title: "Maintenance",
    description: "Regular maintenance to keep your generator running smoothly.",
    icon: Package,
    href: "/services?type=MAINTENANCE",
  },
  {
    title: "Installation",
    description: "Professional installation services for new generators.",
    icon: Zap,
    href: "/services?type=INSTALLATION",
  },
];

export default async function HomePage() {
  const [generators, parts, brands] = await Promise.all([
    getFeaturedGenerators(),
    getFeaturedParts(),
    getBrands(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container-custom relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4" variant="secondary">
              #1 Generator Dealer in Pakistan
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Power Your World with
              <span className="text-gradient bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {" "}Reliable Generators
              </span>
            </h1>
            <p className="mt-6 text-lg text-blue-100 md:text-xl">
              Premium generators, genuine parts, and professional services. 
              From homes to industries, we power Pakistan.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/generators">
                <Button size="xl" className="w-full sm:w-auto">
                  Browse Generators
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button size="xl" variant="outline" className="w-full border-white text-white hover:bg-white/10 sm:w-auto">
                  Request Service
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -bottom-10 left-1/2 h-20 w-[200%] -translate-x-1/2 bg-background" style={{ borderRadius: "100% 100% 0 0" }} />
      </section>

      {/* Features Section - Dynamic from Settings */}
      <FeaturesSection />

      {/* Featured Generators */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container-custom">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold">Featured Generators</h2>
              <p className="mt-2 text-muted-foreground">
                Top-quality generators for every power need
              </p>
            </div>
            <Link href="/generators">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {generators.map((generator: any) => (
              <Link key={generator.id} href={`/generators/${generator.slug}`}>
                <Card className="card-hover h-full">
                  <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                    {generator.images[0] ? (
                      <Image
                        src={generator.images[0].url}
                        alt={generator.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Zap className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                    {generator.compareAtPrice && (
                      <Badge className="absolute left-2 top-2" variant="destructive">
                        Save {Math.round(((generator.compareAtPrice - generator.price) / generator.compareAtPrice) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{generator.brand}</p>
                    <h3 className="mt-1 line-clamp-2 font-semibold">{generator.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">{generator.powerKva} kVA</Badge>
                      <Badge variant="outline">{generator.fuelType}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(generator.price)}
                      </span>
                      {generator.compareAtPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(generator.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-3xl font-bold">Professional Services</h2>
            <p className="mt-2 text-muted-foreground">
              Expert technicians ready to help with all your generator needs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {services.map((service) => (
              <Link key={service.title} href={service.href}>
                <Card className="card-hover h-full p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{service.title}</h3>
                  <p className="mt-2 text-muted-foreground">{service.description}</p>
                  <Button variant="link" className="mt-4">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/services">
              <Button size="lg">
                Request a Service
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Parts */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container-custom">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold">Generator Parts</h2>
              <p className="mt-2 text-muted-foreground">
                Genuine parts for all major generator brands
              </p>
            </div>
            <Link href="/parts">
              <Button variant="outline">
                View All Parts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {parts.map((part: any) => (
              <Link key={part.id} href={`/parts/${part.slug}`}>
                <Card className="card-hover h-full">
                  <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                    {part.images[0] ? (
                      <Image
                        src={part.images[0].url}
                        alt={part.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{part.brand}</p>
                    <h3 className="mt-1 line-clamp-2 font-semibold">{part.name}</h3>
                    <p className="mt-2 text-lg font-bold text-primary">
                      {formatPrice(part.price)}
                    </p>
                    {part.stock > 0 ? (
                      <Badge variant="success" className="mt-2">In Stock</Badge>
                    ) : (
                      <Badge variant="destructive" className="mt-2">Out of Stock</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      {brands.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container-custom">
            <div className="mb-10 text-center">
              <h2 className="font-heading text-3xl font-bold">Trusted Brands</h2>
              <p className="mt-2 text-muted-foreground">
                We partner with the world's leading generator manufacturers
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {brands.map((brand: any) => (
                <div
                  key={brand.id}
                  className="flex h-16 items-center justify-center text-2xl font-bold text-muted-foreground/50"
                >
                  {brand.logo ? (
                    <Image src={brand.logo} alt={brand.name} width={120} height={40} className="opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0" />
                  ) : (
                    brand.name
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
