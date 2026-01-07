"use client";

import { useSettings } from "@/contexts/settings-context";
import { Shield, Truck, Headphones, Wrench } from "lucide-react";

export function FeaturesSection() {
  const { settings, formatPrice } = useSettings();
  const freeThreshold = parseFloat(settings.shipping.freeShippingThreshold) || 50000;

  const features = [
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description: "All generators come with manufacturer warranty and quality assurance.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: `Free shipping on orders over ${formatPrice(freeThreshold)}. Nationwide delivery available.`,
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Our expert team is available round the clock for assistance.",
    },
    {
      icon: Wrench,
      title: "Professional Service",
      description: "Expert technicians for installation, repair, and maintenance.",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
