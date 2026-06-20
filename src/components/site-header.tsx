import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { signOut } from "@/app/auth-actions";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await currentUser();

  return (
    <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            C
          </span>
          <span>מערכת מאמנים</span>
        </Link>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            {user.role === "owner" && (
              <Link
                href="/users"
                className="font-medium text-muted-foreground hover:text-foreground"
              >
                משתמשים
              </Link>
            )}
            <span>
              {user.name}{" "}
              <span className="text-muted-foreground">({user.role})</span>
            </span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                התנתקות
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
