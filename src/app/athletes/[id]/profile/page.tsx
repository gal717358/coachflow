import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PersonalityForm } from "@/components/forms/personality-form";
import { InsightsForm } from "@/components/forms/insights-form";
import { ScoresForm } from "@/components/forms/scores-form";
import { canCurrentUserEdit, getCoachingProfile } from "@/lib/queries";
import {
  COMMUNICATION_LABELS,
  MOTIVATION_STYLE_LABELS,
  titleCase,
} from "@/lib/format";
import type { AthleteScores, Insights, Personality } from "@/lib/types";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ personality, insights, scores }, canEdit] = await Promise.all([
    getCoachingProfile(id),
    canCurrentUserEdit(id),
  ]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>אישיות</CardTitle>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <PersonalityForm athleteId={id} personality={personality} />
          ) : (
            <PersonalityView personality={personality} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>תובנות מהירות</CardTitle>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <InsightsForm athleteId={id} insights={insights} />
          ) : (
            <InsightsView insights={insights} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>דירוג מאמן</CardTitle>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <ScoresForm athleteId={id} scores={scores} />
          ) : (
            <ScoresView scores={scores} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PersonalityView({ personality }: { personality: Personality | null }) {
  if (!personality) return <Empty />;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {personality.motivation_styles.map((m) => (
          <Badge key={m} variant="secondary">
            {MOTIVATION_STYLE_LABELS[m] ?? titleCase(m)}
          </Badge>
        ))}
      </div>
      {personality.communication_style && (
        <div className="text-sm">
          <span className="text-muted-foreground">תקשורת: </span>
          <span className="font-medium">
            {COMMUNICATION_LABELS[personality.communication_style]}
          </span>
        </div>
      )}
      {personality.notes && (
        <p className="text-sm leading-relaxed">{personality.notes}</p>
      )}
    </div>
  );
}

function InsightsView({ insights }: { insights: Insights | null }) {
  if (!insights) return <Empty />;
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <List title="חוזקות" items={insights.strengths} />
      <List title="תחומים לשיפור" items={insights.improvements} />
    </div>
  );
}

function ScoresView({ scores }: { scores: AthleteScores | null }) {
  if (!scores) return <Empty />;
  const rows: [string, number | null][] = [
    ["עקביות", scores.consistency],
    ["משמעת", scores.discipline],
    ["טכניקה", scores.technique],
    ["התקדמות", scores.progress],
    ["מעורבות", scores.engagement],
  ];
  return (
    <dl className="space-y-1.5 text-sm sm:max-w-md">
      {rows.map(([label, v]) => (
        <div key={label} className="flex items-center gap-2">
          <dt className="w-28 text-muted-foreground">{label}</dt>
          <Progress value={(v ?? 0) * 10} className="h-1.5 flex-1" />
          <dd className="w-6 text-end font-medium">{v ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {items.length ? (
        <ul className="space-y-1 text-sm">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">—</p>
      )}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted-foreground">לא הוגדר.</p>;
}
