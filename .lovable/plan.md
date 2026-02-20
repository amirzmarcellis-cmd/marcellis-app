
## Add "Pipeline" Stage to Job Funnel

### What needs to change
The `JobFunnel` component currently tracks these stages: Longlist, 1st No Answer, 2nd No Answer, 3rd No Answer, Contacted, Low Scored, Shortlist, Submitted.

We need to add a **Pipeline** stage that counts candidates where `contacted === "Pipeline"` (or `Contacted === "Pipeline"`).

### File to change — `src/components/jobs/JobFunnel.tsx` only

#### 1. Add `pipeline` counter in the `reduce` accumulator (lines 59-68)

Add `pipeline: 0` to the initial accumulator and a case in the switch:

```ts
case "Pipeline":
  acc.pipeline++;
  break;
```

Initial accumulator becomes:
```ts
{
  firstNoAnswer: 0,
  secondNoAnswer: 0,
  thirdNoAnswer: 0,
  contacted: 0,
  lowScored: 0,
  submitted: 0,
  rejected: 0,
  shortlist: 0,
  pipeline: 0   // NEW
}
```

#### 2. Add Pipeline to `allStages` array (between Shortlist and Submitted)

The logical order in the funnel is: shortlisted → moved to pipeline → submitted. So Pipeline goes between Shortlist and Submitted:

```ts
{ name: "Pipeline", count: counts.pipeline, bgColor: "bg-violet-600", textColor: "text-black dark:text-white" },
```

Full updated `allStages`:
```
Longlist → 1st No Answer → 2nd No Answer → 3rd No Answer → Contacted → Low Scored → Shortlist → Pipeline → Submitted
```

#### 3. Add Pipeline to `mobileStages` array

Mobile currently shows: Longlist → Shortlist → Submitted

Add Pipeline between Shortlist and Submitted:
```ts
{ name: "Pipeline", count: counts.pipeline, bgColor: "bg-violet-600", textColor: "text-black dark:text-white" },
```

### What will NOT change
- All other stages — unchanged
- The count logic for Shortlist, Submitted, Rejected — unchanged
- The `JobFunnel` props interface — unchanged
- `JobDetails.tsx` — unchanged
- No other files touched

### Visual result
The funnel will show a new **violet/purple circle** between Shortlist and Submitted, counting exactly how many candidates have `contacted = "Pipeline"` for that job.
