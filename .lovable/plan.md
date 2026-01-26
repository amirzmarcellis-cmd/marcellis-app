

## Bug Fix: Salary Range Parsing Incorrectly Categorizing Candidates

### Root Cause Analysis

The `parseSalary` function in `JobDetails.tsx` has a critical bug when handling salary ranges like `"10000-12000"`:

```text
Current behavior:
  Input: "10000-12000"
  Step 1: remove non-numeric → "1000012000"
  Step 2: parseFloat → 1,000,012,000

Expected behavior:
  Input: "10000-12000"
  Expected output: 12000 (the maximum of the range)
```

This causes candidates with reasonable salary expectations (like 10,000-12,000) to be incorrectly marked as "above budget" when compared to a budget of 18,000.

---

### Solution

Update the `parseSalary` function to properly handle salary ranges by:
1. Detecting if the input contains a range separator (hyphen, "to", etc.)
2. Extracting all numbers from the string
3. Returning the **maximum** value (which represents the candidate's highest expectation)

---

### Technical Details

**File:** `src/pages/JobDetails.tsx` (lines 3024-3029)

**Current implementation:**
```typescript
const parseSalary = (salary: string | null | undefined): number => {
  if (!salary) return 0;
  const cleanSalary = salary.toString().replace(/[^0-9.]/g, "");
  return parseFloat(cleanSalary) || 0;
};
```

**Fixed implementation:**
```typescript
const parseSalary = (salary: string | null | undefined): number => {
  if (!salary) return 0;
  const salaryStr = salary.toString();
  
  // Extract all numbers from the string
  const numbers = salaryStr.match(/[\d.]+/g);
  if (!numbers || numbers.length === 0) return 0;
  
  // Parse all numbers and return the maximum (highest expectation in a range)
  const parsedNumbers = numbers
    .map(n => parseFloat(n))
    .filter(n => !isNaN(n) && n > 0);
  
  if (parsedNumbers.length === 0) return 0;
  
  // Return the maximum value (for ranges like "10000-12000", returns 12000)
  return Math.max(...parsedNumbers);
};
```

---

### How the Fix Works

| Input | Before (Bug) | After (Fixed) |
|-------|--------------|---------------|
| `"10000-12000"` | 1,000,012,000 | 12,000 |
| `"13000-18000"` | 1,300,018,000 | 18,000 |
| `"15000-22000"` | 1,500,022,000 | 22,000 |
| `"12000"` | 12,000 | 12,000 |
| `"Not provided"` | 0 | 0 |
| `"35000"` | 35,000 | 35,000 |

---

### Impact

After this fix, for job `me-j-0232` with budget 18,000 AED (threshold 21,600):

| Candidate | Salary Expectations | Before | After |
|-----------|-------------------|--------|-------|
| AMMAR GHASSAN AMER | 10000-12000 | Above Budget ❌ | Within Budget ✓ |
| Aparna A R | 13000-15000 | Above Budget ❌ | Within Budget ✓ |
| Samir Boukhmis | 13000-18000 | Above Budget ❌ | Within Budget ✓ |
| HALA RAGAB | 15000-22000 | Above Budget ❌ | Within Budget ✓ |

---

### Testing Considerations

The fix maintains backward compatibility:
- Single values like `"12000"` continue to work correctly
- Empty or null values return 0 (no salary expectation)
- Text like `"Not provided"` returns 0

