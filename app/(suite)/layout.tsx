import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function SuiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
