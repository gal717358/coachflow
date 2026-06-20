import type { Athlete, User } from "./types";

/**
 * Who may add/edit an athlete's coaching data: the studio owner, or a coach
 * assigned as primary or secondary. Coaches cannot edit athletes outside their
 * roster (and per PRD cannot delete athletes or manage users — neither is
 * exposed in this slice).
 */
export function canEditAthlete(
  user: User | null,
  athlete: Pick<Athlete, "primary_coach_id" | "secondary_coach_id">,
): boolean {
  if (!user) return false;
  if (user.role === "owner") return true;
  return (
    athlete.primary_coach_id === user.id ||
    athlete.secondary_coach_id === user.id
  );
}
