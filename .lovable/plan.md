

## Add Confirmation Prompt When Disabling Automatic Dial

Two locations need a confirmation dialog warning users that disabling automatic dial means no calls will be made and no shortlisted candidates will be generated.

### 1. `src/pages/AddJob.tsx` — Longlist Only toggle
When the user toggles "Longlist Only" ON, show an AlertDialog confirming they understand no calls will be made and no candidates will be shortlisted. If they cancel, revert the toggle.

### 2. `src/components/jobs/JobManagementPanel.tsx` — Auto-dial toggle on existing jobs
When `handleAutomaticDialToggle` is called to disable auto-dial (newValue = false), show an AlertDialog before proceeding. If confirmed, execute the update. If cancelled, do nothing.

### Confirmation dialog content
- **Title**: "Disable Automatic Dial?"
- **Description**: "When Automatic Dial is turned off, the system will not make any calls and this job will not receive any shortlisted candidates. Are you sure you want to continue?"
- **Cancel**: "Cancel"
- **Confirm**: "Yes, disable"

### Implementation
- Use the existing `AlertDialog` component from `@/components/ui/alert-dialog`
- In `AddJob.tsx`: wrap the Longlist Only `onCheckedChange` to show dialog when enabling longlist-only mode
- In `JobManagementPanel.tsx`: add state for pending toggle, show dialog before executing the disable action

