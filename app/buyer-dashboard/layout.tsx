import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");
  if (session.user.role !== "buyer") redirect("/farmer-dashboard");
  if (!session.user.twoFactorEnabled) redirect("/security");

  return <>{children}</>;
}