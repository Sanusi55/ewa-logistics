export default function DriverDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* No sidebar - full width content */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}