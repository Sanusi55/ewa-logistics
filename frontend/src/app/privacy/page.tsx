import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, CheckCircle } from "lucide-react";

export default function PrivacyPage() {
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
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Privacy Policy</h1>
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
              <Lock className="w-6 h-6 text-orange-500" />
              EWA LOGISTICS LIMITED – PRIVACY POLICY
            </h2>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-6">
            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-500" />
                Our Commitment to Privacy
              </h3>
              <p className="text-muted-foreground">
                EWA respects user privacy. We are committed to protecting your personal information and maintaining the confidentiality of your data.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3">Information We Collect</h3>
              <p className="text-muted-foreground mb-4">We may collect the following information:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Name</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Phone number</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Email address</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Location data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Order details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Payment records</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Device and usage information</span>
                </li>
              </ul>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3">Purpose of Collection</h3>
              <p className="text-muted-foreground mb-4">We use your information to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Process orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Coordinate logistics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Improve services</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Prevent fraud</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Communicate with users</span>
                </li>
              </ul>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3">Data Sharing</h3>
              <p className="text-muted-foreground">
                EWA does not sell customer data. Information may be shared only with:
              </p>
              <ul className="space-y-2 text-muted-foreground mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Suppliers (for order fulfillment)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Drivers (for delivery coordination)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Payment providers (for transaction processing)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Where legally required</span>
                </li>
              </ul>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3">User Rights</h3>
              <p className="text-muted-foreground">
                Users may request account updates or deletion subject to applicable requirements. Contact us at support@ewalogistics.com to exercise your rights.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3">Security Measures</h3>
              <p className="text-muted-foreground">
                EWA uses reasonable security measures to protect information, including encryption, secure servers, and regular security audits.
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