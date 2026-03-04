import { redirect } from "next/navigation";

// Route group index — forward to /home
// (Avoids conflict with root app/page.tsx which also maps to /)
export default function DashboardIndex() {
  redirect("/home");
}
