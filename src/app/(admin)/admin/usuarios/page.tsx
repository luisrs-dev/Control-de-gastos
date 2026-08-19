import type { Metadata } from "next";
import { getUsers } from "@/actions/admin.actions";
import { auth } from "@/lib/auth";
import { UsersClient } from "@/components/admin/users-client";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsersPage() {
  const [users, session] = await Promise.all([getUsers(), auth()]);
  return <UsersClient initialUsers={users} currentUserId={session?.user.id ?? ""} />;
}
