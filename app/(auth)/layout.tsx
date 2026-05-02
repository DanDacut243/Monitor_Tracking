export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4 fixed inset-0 z-50">
      {children}
    </div>
  )
}
