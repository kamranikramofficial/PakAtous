import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FAQContent } from "./faq-content";

export const metadata = {
  title: "FAQ | Pak Auto Generator",
  description: "Frequently asked questions about Pak Auto Generator - Find answers to common questions about our products and services.",
};

export default function FAQPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about our products, services, and policies.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <FAQContent />
      </div>

      <div className="text-center mt-16 bg-primary/5 rounded-2xl p-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
        <p className="text-muted-foreground mb-8">
          Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button size="lg">Contact Us</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
