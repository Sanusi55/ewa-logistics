import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AcceptableUsePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="glass rounded-2xl border border-border p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl md:text-3xl font-bold">Acceptable Use Policy</h1>
          </div>
          <p className="text-muted-foreground mb-8">Effective Date: 13 August 2026</p>
          
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm md:text-base leading-relaxed">
            <p>EWA Logistics is a construction-material marketplace and logistics platform. By accessing or using EWA Logistics, you agree to comply with this policy.</p>
            
            <h3 className="text-lg font-semibold mt-6 mb-2">1. Permitted Use</h3>
            <p>Users may use EWA Logistics to register, list legitimate materials, purchase materials, arrange delivery, track orders, make payments, and communicate regarding legitimate transactions.</p>

            <h3 className="text-lg font-semibold mt-6 mb-2">2. Prohibited Activities</h3>
            <p>Users must not use EWA Logistics to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sell stolen, counterfeit, or illegally obtained materials.</li>
              <li>Provide false, misleading, or fraudulent identity or payment information.</li>
              <li>Manipulate orders, bids, prices, reviews, or delivery confirmations.</li>
              <li>Falsely confirm delivery or use a verification code for an undelivered order.</li>
              <li>Attempt to bypass EWA’s payment or settlement procedures.</li>
              <li>Harass, threaten, or abuse other users, or violate applicable Nigerian laws.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-2">3. User Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Suppliers:</strong> Ensure materials are legally available, descriptions are accurate, and orders are fulfilled as agreed.</li>
              <li><strong>Drivers:</strong> Provide accurate vehicle info, handle materials responsibly, and never falsely report a delivery.</li>
              <li><strong>Customers:</strong> Provide accurate delivery info, inspect materials upon delivery, and only provide the verification code after receiving the order.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-2">4. Account Suspension & Reporting</h3>
            <p>EWA may suspend or terminate accounts showing evidence of fraud, policy violations, or suspicious activity. Users should report violations through EWA customer support.</p>

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