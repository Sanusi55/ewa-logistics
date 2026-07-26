"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, MapPin, Navigation, DollarSign, Calendar, Loader2, 
  AlertCircle, Clock, MessageSquare, CheckCircle, X 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/dashboard-layout";
import { getAvailableJobs, submitDriverBid } from "@/app/actions/orders";
import { useToast } from "@/components/providers/toast-provider";

export default function DriverJobsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Bidding State
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isBidding, setIsBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [driverMessage, setDriverMessage] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);

  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push("/login");
          return;
        }

        const result = await getAvailableJobs();
        
        if (result.error) {
          setError(result.error);
        } else {
          setJobs(result.jobs || []);
        }
      } catch (err: any) {
        console.error("❌ Load jobs error:", err);
        setError(err.message || "Failed to load jobs");
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuthAndLoad();
  }, [router, supabase]);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const handleOpenBidModal = (job: any) => {
    setSelectedJob(job);
    setBidAmount("");
    setEstimatedTime("");
    setDriverMessage("");
    setIsBidding(true);
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !bidAmount) return;

    setSubmittingBid(true);
    try {
      const result = await submitDriverBid(selectedJob.id, {
        bid_amount: parseFloat(bidAmount),
        estimated_arrival_minutes: estimatedTime ? parseInt(estimatedTime) : undefined,
        driver_message: driverMessage || undefined,
      });

      if (result.error) {
        addToast({ type: "error", title: "Bid Failed", message: result.error });
      } else {
        addToast({ type: "success", title: "Bid Submitted! 🎉", message: "The customer will review your bid shortly." });
        setIsBidding(false);
        
        // Refresh jobs to update the "hasBid" status
        const refreshResult = await getAvailableJobs();
        if (!refreshResult.error) {
          setJobs(refreshResult.jobs || []);
        }
      }
    } catch (err: any) {
      addToast({ type: "error", title: "Error", message: err.message || "Failed to submit bid" });
    } finally {
      setSubmittingBid(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Available Jobs</h1>
          <p className="text-muted-foreground mt-1">Browse open delivery requests and submit your bids</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="glass p-8 rounded-2xl border border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-700 dark:text-red-400 mb-1">Error Loading Jobs</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass p-12 rounded-2xl border border-border text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Available Jobs</h3>
            <p className="text-muted-foreground">Check back soon! New delivery requests will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <motion.div 
                key={job.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl border border-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{job.material_type}</h3>
                    <p className="text-sm text-muted-foreground">{job.tonnage} Tons</p>
                  </div>
                  {job.hasBid ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Bid Submitted
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/30">
                      Open for Bids
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="text-sm font-medium">{job.pickup_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery</p>
                      <p className="text-sm font-medium">{job.delivery_location}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(job.created_at).toLocaleDateString()}
                  </div>
                  <button 
                    onClick={() => handleOpenBidModal(job)}
                    disabled={job.hasBid}
                    className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {job.hasBid ? "Already Bid" : "Submit Bid"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Submit Bid Modal */}
      <AnimatePresence>
        {isBidding && selectedJob && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !submittingBid && setIsBidding(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto border border-border shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Submit Your Bid</h3>
                  <button 
                    onClick={() => setIsBidding(false)}
                    disabled={submittingBid}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border">
                  <p className="text-sm font-semibold">{selectedJob.material_type}</p>
                  <p className="text-xs text-muted-foreground">{selectedJob.tonnage} Tons • {selectedJob.delivery_location}</p>
                </div>

                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Your Delivery Fee (₦) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        required
                        min="1000"
                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="e.g. 50000"
                        disabled={submittingBid}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Estimated Arrival Time (Minutes)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                        min="10"
                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="e.g. 45"
                        disabled={submittingBid}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Message to Customer (Optional)</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <textarea
                        value={driverMessage}
                        onChange={(e) => setDriverMessage(e.target.value)}
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                        placeholder="e.g. I am nearby and can pick this up immediately."
                        disabled={submittingBid}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsBidding(false)}
                      disabled={submittingBid}
                      className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={submittingBid || !bidAmount}
                      className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submittingBid ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Submit Bid</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}