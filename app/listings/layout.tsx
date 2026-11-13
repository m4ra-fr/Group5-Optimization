import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Any signed-in user with 2FA enabled can open /listings.
// The page itself reads session.user.role to decide what to show (pill + order buttons).
export default async function ListingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");
  if (!session.user.twoFactorEnabled) redirect("/security");

  return <>{children}</>;
}