import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Root route — redirect based on auth state
export default async function RootPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect("/home");
}
