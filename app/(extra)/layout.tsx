export default function ExtraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-full text-neutral-900 font-poppins">
      {children}
    </div>
  );
}
