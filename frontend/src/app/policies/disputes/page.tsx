import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export default function DisputeResolutionPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="glass rounded-2xl border border-border p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl md:text-3xl font-bold">Dispute Resolution Policy</h1>
          </div>
          <p className="text-muted-foreground mb-8">Effective Date: 13 August 2026</p>
          
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm md:text-base leading-relaxed">
            <p>EWA Logistics is committed to resolving disputes fairly and transparently for customers, suppliers, and drivers.</p>
            
            <h3 className="text-lg font-semibold mt-6 mb-2">1. Types of Disputes</h3>
            <p>Disputes may include wrong materials delivered, quantity shortages, quality concerns, delivery delays, payment issues, order cancellations, or suspected fraudulent activity.</p>

            <h3 className="text-lg font-semibold mt-6 mb-2">2. How to Report</h3>
            <p>Users should contact EWA support as soon as possible through the available support channels, providing relevant order information and evidence (photos, videos, receipts, etc.).</p>

            <h3 className="text-lg font-semibold mt-6 mb-2">3. Review Process & Temporary Holds</h3>
            <p>EWA will review order records, payment records, delivery confirmations, and communications. Where necessary, EWA may temporarily restrict the withdrawal of disputed earnings while the matter is investigated.</p>

            <h3 className="text-lg font-semibold mt-6 mb-2">4. Resolution Outcomes</h3>
            <p>Possible outcomes include order completion confirmation, refund, replacement, settlement adjustment, or account restriction based on the investigation.</p>

            <h3 className="text-lg font-semibold mt-6 mb-2">5. Fraud and Abuse</h3>
            <p>Accounts involved in suspected fraud, false delivery confirmation, or abuse of the platform may be suspended or terminated immediately.</p>

            <p className="mt-8 pt-6 border-t border-border font-semibold">
              EWA Logistics<br/>
              Website: <a href="https://www.ewalogistics.com" className="text-orange-500 hover:underline">https://www.ewalogistics.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}