import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { user } = session;

  return (
    <div className="flex min-h-dvh bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <Sidebar role={user.role} userName={user.name ?? ""} userEmail={user.email} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:ml-[260px]">
        <Navbar
          role={user.role}
          userName={user.name ?? ""}
          userEmail={user.email}
        />
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
