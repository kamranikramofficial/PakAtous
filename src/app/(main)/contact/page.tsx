import { ContactForm } from "./contact-form";
import { ContactInfo } from "./contact-info";
import { ContactMap } from "./contact-map";
import { ContactFAQ } from "./contact-faq";

export const metadata = {
  title: "Contact Us | Pak Auto Generator",
  description: "Get in touch with Pak Auto Generator for all your generator needs, service requests, and inquiries.",
};

export default function ContactPage() {
  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have questions? We&apos;re here to help. Reach out to us through any of the channels below.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact Information - Dynamic from Settings */}
        <ContactInfo />

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <ContactForm />

          {/* Map - Dynamic */}
          <ContactMap />
        </div>
      </div>

      {/* FAQ Section - Dynamic */}
      <ContactFAQ />
    </div>
  );
}
