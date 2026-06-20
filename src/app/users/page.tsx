import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateUserForm } from "@/components/forms/create-user-form";
import { UserRowActions } from "@/components/forms/user-row-actions";
import { currentUser, listUsers } from "@/lib/auth";

export default async function UsersPage() {
  const me = await currentUser();
  if (!me || me.role !== "owner") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Card className="p-8 text-center text-muted-foreground">
          Only the studio owner can manage users.{" "}
          <Link href="/" className="text-primary underline">
            Back to dashboard
          </Link>
        </Card>
      </div>
    );
  }

  const users = await listUsers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage studio owners and coaches.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add User</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-start text-muted-foreground">
                  <th className="py-2 pe-4 font-medium">Name</th>
                  <th className="py-2 pe-4 font-medium">Email</th>
                  <th className="py-2 pe-4 font-medium">Role</th>
                  <th className="py-2 ps-4 text-end font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-3 pe-4 font-medium">{u.name}</td>
                    <td className="py-3 pe-4 text-muted-foreground">{u.email}</td>
                    <td className="py-3 pe-4">
                      <Badge variant={u.role === "owner" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 ps-4">
                      <UserRowActions user={u} isSelf={u.id === me.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
