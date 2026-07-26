import Link from "next/link";
import { ArrowLeft, CreditCard, CheckCircle, XCircle } from "lucide-react";

export default function RefundPolicyPage() {
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
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Payment & Refund Policy</h1>
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
              <CreditCard className="w-6 h-6 text-orange-500" />
              EWA LOGISTICS LIMITED – PAYMENT & REFUND POLICY
            </h2>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-6">
            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">1</span>
                Payment Collection
              </h3>
              <p className="text-muted-foreground">
                EWA receives payments from customers and coordinates settlement with suppliers and drivers.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">2</span>
                Payment Confirmation
              </h3>
              <p className="text-muted-foreground">
                Orders become active only after successful payment confirmation.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">3</span>
                Pricing
              </h3>
              <p className="text-muted-foreground">
                Charges, logistics fees, commissions, and service fees may change and will be displayed on the platform.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">4</span>
                Refund Eligibility
              </h3>
              <p className="text-muted-foreground mb-4">Refund requests may be considered where:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Payment was duplicated</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Order could not be fulfilled</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Supplier could not provide confirmed materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Cancellation qualifies under policy</span>
                </li>
              </ul>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">5</span>
                Non-Refund Situations
              </h3>
              <p className="text-muted-foreground mb-4">Refunds may not apply after:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span>Completed delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span>Confirmed fulfillment</span>
                </li>
              </ul>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">6</span>
                Settlement
              </h3>
              <p className="text-muted-foreground">
                Supplier and driver settlements are processed after operational confirmation.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">7</span>
                Processing Time
              </h3>
              <p className="text-muted-foreground">
                Approved refunds are processed within a reasonable period (typically 5-7 business days).
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">8</span>
                Fraud Prevention
              </h3>
              <p className="text-muted-foreground">
                Suspicious transactions may be reviewed before payment release to protect all parties.
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