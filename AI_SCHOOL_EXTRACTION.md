# AI-Based School Name Extraction Implementation

## Overview

This implementation adds dynamic school name extraction from user queries using AI, enabling intelligent retrieval strategy switching based on whether the user is asking about specific schools.

## Problem Solved

Previously, the system used similarity-based retrieval for all queries, which was suboptimal for school-specific questions:

- ❌ **Before**: "Should I apply to Stanford?" → Retrieved similar students regardless of whether they applied to Stanford
- ✅ **After**: "Should I apply to Stanford?" → Retrieves only students who specifically applied to Stanford

## How It Works

### 1. School Name Extraction (`extractSchoolNames`)

**Location**: `/src/integrations/openai/client.ts`

A new function uses GPT-4o-mini to extract school names from user queries:

```typescript
export async function extractSchoolNames(query: string): Promise<string[]>
```

**Features**:
- Uses a specialized system prompt to identify college/university names
- Returns full, official school names (e.g., "Stanford University" not "Stanford")
- Returns empty array if no schools are mentioned
- Uses `temperature: 0` for deterministic results

**Examples**:
- Input: "Should I apply to Stanford?" → Output: `["Stanford University"]`
- Input: "Compare Harvard and Yale" → Output: `["Harvard University", "Yale University"]`
- Input: "Help me build a school list" → Output: `[]`

### 2. School-Based Student Retrieval (`fetchStudentsBySchool`)

**Location**: `/src/integrations/supabase/search.ts`

A new function that fetches students who applied to specific schools:

```typescript
export async function fetchStudentsBySchool(
  schoolNames: string[],
  options: { k?: number; maxTotalChars?: number }
): Promise<{ block: string; matches: KbMatch[] }>
```

**Features**:
- Fetches all student profiles from the database
- Filters profiles that mention any of the specified school names (case-insensitive)
- Returns up to `k` matching profiles (default: 10)
- Formats the results into a context block for the AI

### 3. Intelligent Retrieval Strategy (`handleSend`)

**Location**: `/src/pages/Index.tsx`

The main chat handler now implements a multi-step retrieval strategy:

```typescript
// STEP 1: Extract school names from the query using AI
const schoolNames = await extractSchoolNames(text);

// STEP 2: Choose retrieval strategy
if (schoolNames.length > 0) {
  // School-specific retrieval
  const { block } = await fetchStudentsBySchool(schoolNames, { k: 10, maxTotalChars: 4000 });
} else if (profileData) {
  // Similarity-based retrieval
  const { block } = await buildSimilarProfilesBlock(profileData, { k: 5, maxTotalChars: 4000 });
}
```

**Flow**:
1. User sends a query
2. AI extracts school names from the query
3. **If schools found**: Fetch 10 students who applied to those schools
4. **If no schools found**: Fetch 5 similar students based on user's profile
5. Add a NOTE to the system prompt explaining which retrieval method was used
6. Generate response using the appropriate context

### 4. Enhanced System Prompt

**Location**: `/src/config/prompts.ts`

Added a new section to guide the AI on handling school-specific queries:

```
**🎯 IMPORTANT: SCHOOL-SPECIFIC QUERIES**
When a user asks about a SPECIFIC SCHOOL, you will be provided with 
student profiles who SPECIFICALLY applied to that school.

- Focus your analysis on comparing the user's profile to these school-specific applicants
- Reference the acceptance/rejection outcomes at the specific school
- Discuss what made accepted vs rejected students different
- Be data-driven: "Of the 8 students who applied to Stanford, 3 were accepted..."
```

## Benefits

### 1. **More Relevant Comparisons**
- Users asking "Should I apply to MIT?" now see students who actually applied to MIT
- Better signal for understanding competitiveness at specific schools

### 2. **Data-Driven School Lists**
- When building school lists, the AI can compare against students who applied to various schools
- More accurate reach/target/safety categorization

### 3. **Dynamic & Scalable**
- No need to maintain a hardcoded list of schools
- AI automatically recognizes any college/university name
- Works with international schools, community colleges, etc.

### 4. **Contextual Responses**
- General questions still use similarity matching
- School-specific questions use targeted retrieval
- Best of both worlds

## Query Type Detection

The system automatically handles different query types:

| Query Type | Example | Retrieval Method | Profiles Fetched |
|------------|---------|------------------|------------------|
| School-specific | "Should I apply to Stanford?" | School-based | Students who applied to Stanford (10) |
| General advice | "What opportunities should I pursue?" | Similarity-based | Similar students by profile (5) |
| How-to | "How do I get into DECA?" | Similarity-based | Similar students by profile (5) |
| School list | "Help me build a school list" | Similarity-based | Similar students by profile (5) |
| Multi-school | "Compare Harvard vs MIT for me" | School-based | Students who applied to Harvard or MIT (10) |

## Technical Details

### Performance
- School name extraction adds ~200-500ms latency (one GPT call)
- This is an acceptable tradeoff for significantly better relevance
- Runs in parallel with other operations where possible

### Error Handling
- If school extraction fails, falls back to similarity search
- Logs errors to console for debugging
- Gracefully handles missing data

### Context Limits
- School-specific queries fetch up to 10 profiles (4000 chars)
- General queries fetch up to 5 profiles (4000 chars)
- KB context still fetched separately (1800 chars)

## Example Scenarios

### Scenario 1: School-Specific Question

**User**: "Should I apply to Stanford University?"

**System Flow**:
1. Extract schools → `["Stanford University"]`
2. Fetch students who applied to Stanford → 8 profiles found
3. Context: "Student Profiles - Applied to Stanford University"
4. AI compares user's profile to these 8 Stanford applicants
5. Response: Data-driven analysis of acceptance chances

### Scenario 2: General Question

**User**: "What competitions should I do for computer science?"

**System Flow**:
1. Extract schools → `[]` (no schools mentioned)
2. Fetch similar students based on user's CS interest → 5 profiles
3. Context: "Similar Student Profiles"
4. AI recommends competitions these similar students did
5. Response: Activity recommendations grounded in similar profiles

### Scenario 3: Multiple Schools

**User**: "Compare my chances at Harvard, Yale, and Princeton"

**System Flow**:
1. Extract schools → `["Harvard University", "Yale University", "Princeton University"]`
2. Fetch students who applied to any of these schools → 10 profiles
3. Context: "Student Profiles - Applied to Harvard University, Yale University, Princeton University"
4. AI analyzes outcomes across all three schools
5. Response: Comparative analysis with acceptance rates and differentiators

## Future Enhancements

Possible improvements for the future:

1. **Caching**: Cache school name extraction results to avoid redundant API calls
2. **Semantic Matching**: Use fuzzy matching for school names (e.g., "MIT" → "Massachusetts Institute of Technology")
3. **Multi-Stage Retrieval**: Combine similarity + school filtering for even more relevant results
4. **Analytics**: Track which queries trigger school-specific vs general retrieval
5. **Vector Search**: Use embeddings to find similar schools if exact matches not found

## Files Modified

1. `/src/integrations/openai/client.ts` - Added `extractSchoolNames` function
2. `/src/integrations/supabase/search.ts` - Added `fetchStudentsBySchool` function
3. `/src/pages/Index.tsx` - Implemented intelligent retrieval strategy
4. `/src/config/prompts.ts` - Added school-specific query guidance

## Testing

To test the implementation:

1. Ask a school-specific question: "Should I apply to Stanford?"
   - Check console logs for extracted school names
   - Verify the response references students who applied to Stanford

2. Ask a general question: "What internships should I pursue?"
   - Verify it uses similarity-based retrieval
   - Check that recommendations are based on similar students

3. Ask about multiple schools: "Compare Harvard and MIT for me"
   - Verify both schools are extracted
   - Check that profiles include students who applied to either school

## Conclusion

This implementation solves the school-specific query problem using AI-based extraction, eliminating the need for hardcoded school lists while providing more relevant and data-driven responses to users.

