export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell min-h-screen bg-background md:bg-muted/30">
      {/* Full-width on mobile, centered container on desktop */}
      <div className="w-full md:max-w-[480px] md:mx-auto md:shadow-xl md:bg-background min-h-screen">
        {children}
      </div>
    </div>
  );
}
