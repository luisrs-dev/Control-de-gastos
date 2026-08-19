import type { Metadata } from "next";
import { getCostCenters, getUsers } from "@/actions/admin.actions";
import { auth } from "@/lib/auth";
import { UsersClient } from "@/components/admin/users-client";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsersPage() {
  const [users, costCenters, session] = await Promise.all([
    getUsers(),
    getCostCenters(),
    auth(),
  ]);
  return (
    <UsersClient
      initialUsers={users}
      availableCostCenters={costCenters.map(({ id, name }) => ({ id, name }))}
      currentUserId={session?.user.id ?? ""}
    />
  );
}
