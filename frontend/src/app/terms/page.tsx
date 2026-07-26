import Link from "next/link";
import { ArrowLeft, FileText, Shield, CheckCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Terms & Conditions</h1>
              <p className="text-xs text-muted-foreground">EWA Logistics Limited</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="mb-8 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Shield className="w-6 h-6 text-orange-500" />
              EWA LOGISTICS LIMITED – TERMS & CONDITIONS
            </h2>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-6">
            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">1</span>
                Acceptance
              </h3>
              <p className="text-muted-foreground">
                By accessing or using EWA's website or mobile application, users agree to comply with these Terms.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">2</span>
                Platform Role
              </h3>
              <p className="text-muted-foreground">
                EWA operates as a digital platform connecting customers, suppliers, and drivers for coordination, sourcing, logistics, and delivery of construction materials.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">3</span>
                Accounts
              </h3>
              <p className="text-muted-foreground">
                Users must provide accurate information and maintain account security.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">4</span>
                Orders & Confirmation
              </h3>
              <p className="text-muted-foreground">
                Orders are subject to supplier confirmation and availability.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">5</span>
                Payments
              </h3>
              <p className="text-muted-foreground">
                All payments for orders processed through EWA must be made through EWA-approved payment channels.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">6</span>
                Communication
              </h3>
              <p className="text-muted-foreground">
                Customers, suppliers, and drivers may communicate for order coordination. Transactions completed outside EWA may not be supported or protected.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">7</span>
                Delivery
              </h3>
              <p className="text-muted-foreground">
                Delivery timelines are estimates and may be affected by traffic, weather, supplier readiness, or operational conditions.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">8</span>
                Verification
              </h3>
              <p className="text-muted-foreground">
                EWA may verify users, suppliers, and drivers before granting access to certain services.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">9</span>
                Suspension
              </h3>
              <p className="text-muted-foreground">
                EWA reserves the right to suspend accounts involved in fraud, abuse, false information, or policy violations.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">10</span>
                Limitation of Liability
              </h3>
              <p className="text-muted-foreground">
                EWA facilitates coordination and shall not be liable for indirect losses except where required by law.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">11</span>
                Updates
              </h3>
              <p className="text-muted-foreground">
                These Terms may be updated periodically. Users will be notified of significant changes through the platform.
              </p>
            </section>
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-orange-500" />
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>EWA Logistics Limited</strong></p>
              <p>RC: 9608218</p>
              <p>Phone: +234 816 130 5942</p>
              <p>WhatsApp: 0903 579 0128</p>
              <p>Address: Babangida Market FHA Lugbe, Abuja, Nigeria</p>
              <p>Email: support@ewalogistics.com</p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}