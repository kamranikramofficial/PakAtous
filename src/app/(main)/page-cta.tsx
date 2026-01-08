"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/settings-context";

export function CTASection() {
  const { settings } = useSettings();
  
  const phoneNumber = settings.general.sitePhone || "+92 300 1234567";
  const phoneLink = `tel:${phoneNumber.replace(/\s/g, '')}`;

  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="container-custom text-center">
        <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
          Need Help Choosing the Right Generator?
        </h2>
        <p className="mt-4 text-lg text-primary-foreground/80">
          Our experts are here to help you find the perfect power solution for your needs.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/contact">
            <Button size="lg" variant="secondary">
              Contact Us
            </Button>
          </Link>
          <Link href={phoneLink}>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Call: {phoneNumber}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
