import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStaff } from "@/lib/server/moderation";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const metadata: Metadata = { title: "Admin panel" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const staff = await getStaff();
  if (!staff) notFound(); // non-staff don't even learn that this page exists
  return <AdminConsole role={staff.role} username={staff.username} />;
}
