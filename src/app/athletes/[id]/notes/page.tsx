import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoteForm } from "@/components/forms/note-form";
import { canCurrentUserEdit, getNotes } from "@/lib/queries";
import { formatDate, NOTE_CATEGORY_LABELS } from "@/lib/format";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [notes, canEdit] = await Promise.all([
    getNotes(id),
    canCurrentUserEdit(id),
  ]);

  return (
    <div className="space-y-5">
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Add Note</CardTitle>
          </CardHeader>
          <CardContent>
            <NoteForm athleteId={id} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <ol className="relative space-y-5 border-s ps-5">
              {notes.map((n) => (
                <li key={n.id} className="relative">
                  <span className="absolute -start-[1.46rem] top-1.5 size-2.5 rounded-full bg-primary" />
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">
                      {NOTE_CATEGORY_LABELS[n.category]}
                    </Badge>
                    <span>{formatDate(n.created_at)}</span>
                    {n.coachName ? <span>· {n.coachName}</span> : null}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">{n.note}</p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
