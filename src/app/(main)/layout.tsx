import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MaintenanceMode } from "@/components/maintenance-mode";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MaintenanceMode>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </MaintenanceMode>
  );
}
