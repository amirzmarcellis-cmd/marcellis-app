

## Add Quick-Add Tier Presets to Headhunting Companies Field

### Overview
Add "Tier 1" and "Consulting" quick-add buttons above the Headhunting Companies search dropdown. Clicking a tier button auto-selects all companies in that tier. This applies to the Add Job, Edit Job, and Job Dialog pages.

### Changes

#### 1. Update `ApiMultiSelect` component (`src/components/ui/api-multi-select.tsx`)
- Add an optional `presetGroups` prop: `Array<{ label: string; items: string[] }>`
- When provided, render quick-add buttons above the search dropdown inside the popover
- Clicking a group button adds all its items to the selected values (skipping duplicates)
- Each group button shows a check icon if all its items are already selected
- Clicking when all are selected will deselect the group's items

#### 2. Define preset data as a shared constant
Create a small shared constant (in a new file `src/constants/headhunting-presets.ts`) containing:

```text
Tier 1: NVIDIA, OpenAI, Microsoft, Alphabet (Google), Anthropic, xAI, Palantir, 
        Databricks, Injazat, TII (Technology Innovation Institute), ASML, 
        Hugging Face, Snowflake, Scale AI, Synthesia, Perplexity AI

Consulting: Infosys, HCLTech, Persistent Systems, Fractal Analytics, Wayve, 
            Quantexa, Graphcore, Darktrace, Accenture, Deloitte, IBM Consulting, 
            Capgemini, Cognizant, PwC, DXC Technology
```

#### 3. Update `AddJob.tsx` (line ~1359)
- Import the presets constant
- Pass `presetGroups` prop to the `ApiMultiSelect` for headhunting companies

#### 4. Update `EditJob.tsx` (line ~964)
- Import the presets constant
- Pass `presetGroups` prop to the `ApiMultiSelect` for headhunting companies

#### 5. Update `JobDialog.tsx` (line ~333, headhunting section)
- The JobDialog uses a manual input/add pattern, not `ApiMultiSelect`. Add the same quick-add tier buttons above the URL input field there as well, using simple button groups.

### Technical Details

**New file: `src/constants/headhunting-presets.ts`**
- Exports `headhuntingPresetGroups` array with `{ label, items }` structure

**`ApiMultiSelect` changes:**
- New optional prop: `presetGroups?: Array<{ label: string; items: string[] }>`
- Renders a row of styled buttons inside the popover (above search results) or above the trigger
- Toggle behavior: if all items in a group are already selected, clicking removes them; otherwise adds missing ones

**No database or backend changes required. Existing save logic already joins the array to comma-separated strings.**
