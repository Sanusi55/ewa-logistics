import { cn } from "@/lib/utils";

// --- Base Skeleton Component ---
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-shimmer rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// --- Card Skeleton ---
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass p-6 rounded-2xl border border-border space-y-4", className)}>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

// --- Table Skeleton ---
function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("glass rounded-2xl border border-border overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-muted/50 p-4 flex gap-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-t border-border flex gap-4 items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// --- Text Block Skeleton (✅ FIXED: No Math.random) ---
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  // Deterministic widths to prevent hydration mismatch
  const widths = ["100%", "90%", "80%", "95%", "85%", "75%"];
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}

// --- Stats Grid Skeleton ---
function SkeletonStats({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass p-6 rounded-2xl border border-border space-y-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// --- Profile/Avatar Skeleton ---
function SkeletonProfile({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

// --- Blog Post Skeleton ---
function SkeletonBlogPost({ className }: { className?: string }) {
  return (
    <div className={cn("glass rounded-2xl border border-border overflow-hidden", className)}>
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

// --- Full Page Loading Skeleton ---
function SkeletonPage({ type = "dashboard", className }: { type?: "dashboard" | "blog" | "table" | "cards"; className?: string }) {
  return (
    <div className={cn("min-h-screen bg-background pt-24 px-4 md:px-6", className)}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>

        {/* Content based on type */}
        {type === "dashboard" && (
          <>
            <SkeletonStats count={4} />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <SkeletonTable rows={5} />
          </>
        )}

        {type === "blog" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonBlogPost />
            <SkeletonBlogPost />
            <SkeletonBlogPost />
            <SkeletonBlogPost />
            <SkeletonBlogPost />
            <SkeletonBlogPost />
          </div>
        )}

        {type === "table" && <SkeletonTable rows={8} />}

        {type === "cards" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
  SkeletonStats,
  SkeletonProfile,
  SkeletonBlogPost,
  SkeletonPage,
};