import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");
  if (session.user.role !== "farmer") redirect("/buyer-dashboard");
  if (!session.user.twoFactorEnabled) redirect("/security");

  return <>{children}</>;
}