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
          רק בעל הסטודיו יכול לנהל משתמשים.{" "}
          <Link href="/" className="text-primary underline">
            חזרה ללוח הבקרה
          </Link>
        </Card>
      </div>
    );
  }

  const users = await listUsers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">משתמשים</h1>
        <p className="text-sm text-muted-foreground">
          ניהול בעלים ומאמנים בסטודיו.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>הוספת משתמש</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>כל המשתמשים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-start text-muted-foreground">
                  <th className="py-2 pe-4 font-medium">שם</th>
                  <th className="py-2 pe-4 font-medium">אימייל</th>
                  <th className="py-2 pe-4 font-medium">תפקיד</th>
                  <th className="py-2 ps-4 text-end font-medium">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-3 pe-4 font-medium">{u.name}</td>
                    <td className="py-3 pe-4 text-muted-foreground">{u.email}</td>
                    <td className="py-3 pe-4">
                      <Badge variant={u.role === "owner" ? "default" : "secondary"}>
                        {u.role === "owner" ? "בעלים" : "מאמן"}
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
