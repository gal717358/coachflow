import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateAthleteForm } from "@/components/forms/create-athlete-form";
import { currentUser, listUsers } from "@/lib/auth";

export default async function NewAthletePage() {
  const me = await currentUser();
  if (!me || (me.role !== "owner" && me.role !== "coach")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Card className="p-8 text-center text-muted-foreground">
          אין לך הרשאה להוסיף מתאמנים.{" "}
          <Link href="/" className="text-primary underline">
            חזרה ללוח הבקרה
          </Link>
        </Card>
      </div>
    );
  }

  const coaches = (await listUsers()).filter((u) => u.role === "coach");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">מתאמן חדש</h1>
        <p className="text-sm text-muted-foreground">
          הוספת מתאמן לסטודיו ושיוכו למאמן.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי המתאמן</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAthleteForm
            coaches={coaches}
            defaultCoachId={me.role === "coach" ? me.id : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
