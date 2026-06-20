import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReassignForm } from "@/components/forms/reassign-form";
import { CopySummaryButton } from "@/components/copy-summary-button";
import { currentUser, listUsers } from "@/lib/auth";
import {
  getAssessments,
  getAthleteSnapshot,
  getMovementAssessments,
} from "@/lib/queries";
import { buildHandoff, handoffToText } from "@/lib/handoff";
import { fullName } from "@/lib/format";
import { notFound } from "next/navigation";

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {items.length ? (
        <ul className="space-y-1 text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">—</p>
      )}
    </div>
  );
}

export default async function TransferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [snap, assessments, movements, user, users] = await Promise.all([
    getAthleteSnapshot(id),
    getAssessments(id),
    getMovementAssessments(id),
    currentUser(),
    listUsers(),
  ]);
  if (!snap) notFound();

  const handoff = buildHandoff({
    status: snap.athlete.status,
    latestAssessment: assessments[0] ?? null,
    movements,
    insights: snap.insights,
    personality: snap.personality,
    scores: snap.scores,
    current: snap.current,
    latestNote: snap.latestNote,
    topGoal: snap.topGoal,
  });
  const text = handoffToText(fullName(snap.athlete), handoff);
  const isOwner = user?.role === "owner";

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Handoff Summary</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Auto-generated from assessments, goals, ratings, personality, and
                notes. Share this when transferring the athlete to another coach.
              </p>
            </div>
            <CopySummaryButton text={text} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <section className="space-y-4">
              <h3 className="font-semibold">Professional Summary</h3>
              <div className="text-sm">
                <span className="text-muted-foreground">Current level: </span>
                <span className="font-medium">
                  {handoff.professional.currentLevel}
                </span>
              </div>
              <SummaryList title="Strengths" items={handoff.professional.strengths} />
              <SummaryList title="Weaknesses" items={handoff.professional.weaknesses} />
              <SummaryList
                title="Injury considerations"
                items={handoff.professional.injuries}
              />
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold">Personality Summary</h3>
              <SummaryList
                title="Motivation triggers"
                items={handoff.personality.motivationTriggers}
              />
              <SummaryList
                title="Communication preferences"
                items={handoff.personality.communication}
              />
              <SummaryList
                title="Retention risks"
                items={handoff.personality.retentionRisks}
              />
            </section>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reassign Coaches</CardTitle>
        </CardHeader>
        <CardContent>
          {isOwner ? (
            <ReassignForm
              athleteId={id}
              users={users}
              primaryId={snap.athlete.primary_coach_id}
              secondaryId={snap.athlete.secondary_coach_id}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Current coaches:{" "}
              <span className="font-medium text-foreground">
                {snap.primaryCoach?.name ?? "—"}
              </span>
              {snap.secondaryCoach ? ` & ${snap.secondaryCoach.name}` : ""}.
              Only the studio owner can reassign coaches.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
