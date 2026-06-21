"use client";

import { useActionState } from "react";
import {
  deleteUser,
  updateUserRole,
  type FormState,
} from "@/app/users/actions";
import { Button } from "@/components/ui/button";
import { selectClass } from "./shared";
import { SubmitButton } from "./submit-button";
import type { User } from "@/lib/types";

const initial: FormState = { ok: false };

export function UserRowActions({
  user,
  isSelf,
}: {
  user: User;
  isSelf: boolean;
}) {
  const roleAction = updateUserRole.bind(null, user.id);
  const delAction = deleteUser.bind(null, user.id);
  const [roleState, roleFormAction] = useActionState(roleAction, initial);
  const [delState, delFormAction] = useActionState(delAction, initial);

  if (isSelf) {
    return <span className="text-xs text-muted-foreground">אתה</span>;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <form action={roleFormAction} className="flex items-center gap-1.5">
        <select
          name="role"
          defaultValue={user.role}
          className={`${selectClass} h-8 w-28`}
        >
          <option value="coach">מאמן</option>
          <option value="owner">בעלים</option>
        </select>
        <SubmitButton>שמור</SubmitButton>
      </form>
      <form
        action={delFormAction}
        onSubmit={(e) => {
          if (!confirm(`למחוק את ${user.name}? לא ניתן לבטל פעולה זו.`))
            e.preventDefault();
        }}
      >
        <Button type="submit" variant="outline" size="sm">
          מחק
        </Button>
      </form>
      {(roleState.error || delState.error) && (
        <span className="w-full text-end text-xs text-destructive">
          {roleState.error || delState.error}
        </span>
      )}
    </div>
  );
}
