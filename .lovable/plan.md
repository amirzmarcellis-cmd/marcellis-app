
## Add Pipeline Section to AI Shortlist Tab

### What the user wants
A dedicated **"Pipeline" section** inside the AI Shortlist tab that shows all candidates whose `contacted` status is `"Pipeline"`. These candidates should appear there and NOT in the Within Budget / Above Budget sections (since they already have a dedicated section).

### Current State
- `shortListCandidates` includes Pipeline candidates — they currently show up in Within Budget or Above Budget sections
- There are 4 existing sections: Within Budget, Above Budget, Not in Preferred Nationality, Rejected Candidates
- The `renderCandidateCard` function is already used by all sections — reuse it for the new Pipeline section

### Changes — `src/pages/JobDetails.tsx` only

#### 1. Add a `pipelineShortListCandidates` computed variable (after line 3241)

```ts
// Pipeline candidates (after_call_score >= 74 AND contacted === "Pipeline")
const pipelineShortListCandidates = candidates
  .filter((candidate) => {
    const score = parseFloat(candidate.after_call_score || "0");
    const isPipeline = candidate["Contacted"] === "Pipeline" || candidate["contacted"] === "Pipeline";
    const isFromSimilarJobs = candidate["contacted"] === "Shortlisted from Similar jobs";
    return score >= 74 && isPipeline && !isFromSimilarJobs;
  })
  .sort((a, b) => calculateOverallScore(b) - calculateOverallScore(a));
```

#### 2. Exclude Pipeline candidates from `shortListCandidates` (line 3220)

Change:
```ts
return score >= 74 && !isRejected && !isFromSimilarJobs;
```
To:
```ts
const isPipeline = candidate["Contacted"] === "Pipeline" || candidate["contacted"] === "Pipeline";
return score >= 74 && !isRejected && !isFromSimilarJobs && !isPipeline;
```

This ensures Pipeline candidates no longer appear in Within Budget or Above Budget — they will only appear in the new Pipeline section.

#### 3. Add the Pipeline section in the JSX (after the Rejected Candidates `</Card>`, before `</div></TabsContent>`, around line 5510)

The new section follows the exact same pattern as Rejected Candidates:

```tsx
{/* Pipeline Section */}
<Card className="max-w-full overflow-hidden">
  <CardHeader className="p-3 sm:p-6">
    <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
      <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 text-purple-500" />
      Pipeline ({pipelineShortListCandidates.length} candidates)
    </CardTitle>
    <CardDescription className="text-xs sm:text-sm mt-1">
      Candidates who have been moved to the pipeline
    </CardDescription>
  </CardHeader>
  <CardContent>
    {pipelineShortListCandidates.length === 0 ? (
      <div className="text-center py-8">
        <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No pipeline candidates</h3>
        <p className="text-muted-foreground">
          Candidates added to the pipeline will appear here
        </p>
      </div>
    ) : (
      <ScrollArea className="h-[600px] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 pr-2 sm:pr-4 w-full max-w-full">
          {(() => {
            const grouped = pipelineShortListCandidates.reduce((acc, candidate) => {
              const cId = candidate["user_id"] || candidate["Candidate_ID"];
              if (!acc[cId]) acc[cId] = [];
              acc[cId].push(candidate);
              return acc;
            }, {} as Record<string, any[]>);

            return Object.entries(grouped)
              .sort(([, a], [, b]) => calculateOverallScore(b[0]) - calculateOverallScore(a[0]))
              .map(([candidateId, candidateContacts]) => {
                const mainCandidate = candidateContacts[0];
                return renderCandidateCard(candidateId, candidateContacts, mainCandidate);
              });
          })()}
        </div>
      </ScrollArea>
    )}
  </CardContent>
</Card>
```

#### 4. `GitBranch` import check
`GitBranch` was already added in the previous implementation to `JobDetails.tsx`. No new import needed if it's already there.

### What will NOT change
- Within Budget section — unchanged (Pipeline candidates just won't appear there anymore since they're excluded)
- Above Budget section — unchanged
- Not in Preferred Nationality section — unchanged
- Rejected Candidates section — unchanged
- Submit button — unchanged
- Reject button — unchanged
- Pipeline button behavior (DB update + local state) — unchanged
- Live Feed pipeline section — unchanged
- No other files touched
