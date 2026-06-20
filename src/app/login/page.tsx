import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  // Already signed in → go to the dashboard.
  if (await currentUser()) redirect("/");

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-4">
      <div className="mb-6 flex items-center gap-2 font-semibold">
        <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
          C
        </span>
        <span>מערכת מאמנים</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>התחברות</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
