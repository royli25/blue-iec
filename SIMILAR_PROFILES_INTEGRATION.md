# Similar Student Profiles Integration

## Overview

The chat interface now automatically injects similar student profiles alongside relevant knowledge base content to provide data-driven, personalized college admissions advice.

## How It Works

### 1. Profile-Based Similarity Search

When a user asks a question in the chat:

1. **User Profile Analysis**: The system takes the current user's profile data (GPA, SAT, activities, AP exams, awards) and converts it into a natural language search query.

2. **Similar Profile Retrieval**: Using semantic search with embeddings, the system finds 3 similar student profiles from the knowledge base who have:
   - Similar academic credentials (GPA, test scores)
   - Similar interests and activities
   - Similar awards and achievements
   - Similar AP coursework

3. **Question-Based KB Search**: Simultaneously, the system searches the knowledge base for content relevant to the user's specific question.

4. **Context Injection**: Both the similar profiles and relevant KB content are injected into the AI's context, allowing it to:
   - Compare the user against real student outcomes
   - Provide data-driven recommendations
   - Reference actual acceptance/rejection patterns
   - Benchmark the user's profile

## Implementation Details

### Files Modified

1. **`src/integrations/supabase/search.ts`**
   - Added `buildProfileSearchQuery()`: Converts user profile data into a semantic search query
   - Added `buildSimilarProfilesBlock()`: Retrieves and formats similar student profiles
   - Added `formatStudentProfile()`: Formats profile data for context injection

2. **`src/components/ChatBot.tsx`**
   - Modified `sendMessage()` to fetch similar profiles based on user's profile
   - Combines similar profiles with question-based KB search
   - Injects both context blocks into the AI prompt

3. **`src/config/prompts.ts`**
   - Updated `SYSTEM_HOME_CHAT` to include instructions on using similar profile context
   - Added guidelines for benchmarking and comparison

### Data Flow

```
User asks question
       ↓
┌──────────────────────────────┐
│  User Profile (from DB)      │
│  - GPA, SAT, Activities, etc │
└──────────────────────────────┘
       ↓
buildProfileSearchQuery()
       ↓
"Student with GPA 3.9, SAT 1520, interested in robotics and CS..."
       ↓
Embed → Vector Search (filter: kind = 'student_profile')
       ↓
┌──────────────────────────────┐
│  3 Similar Student Profiles  │
│  - Academic stats            │
│  - Activities & interests    │
│  - Acceptance/rejection data │
│  - Hook context              │
└──────────────────────────────┘
       ↓
       +
       ↓
┌──────────────────────────────┐
│  User's Question             │
└──────────────────────────────┘
       ↓
Embed → Vector Search (all kinds)
       ↓
┌──────────────────────────────┐
│  3 Relevant KB Entries       │
│  - Yale podcast chunks       │
│  - Other knowledge content   │
└──────────────────────────────┘
       ↓
Combine both context blocks
       ↓
Inject into AI system prompt
       ↓
AI generates personalized response
```

## Profile Search Query Format

The system converts structured profile data into natural language:

**Input:**
```json
{
  "gpa": "3.9 UW / 4.5 W",
  "sat": "1520 (760 EBRW / 760 Math)",
  "activities": [
    {
      "name": "Robotics Team Captain",
      "description": "Led team to state championships"
    }
  ],
  "apExams": [
    { "exam": "AP Computer Science A", "score": "5" }
  ],
  "awards": [
    { "name": "USACO Gold Division", "level": "national" }
  ]
}
```

**Output Query:**
```
Student with GPA 3.9 UW / 4.5 W. SAT score 1520 (760 EBRW / 760 Math). 
Interested in and involved with: Robotics Team Captain Led team to state 
championships. Awards: USACO Gold Division. AP courses: AP Computer Science A.
```

## Context Block Format

### Similar Profiles Block

```
Similar Student Profiles
These are profiles of students with similar backgrounds and interests:

[Student Profile 1]
Name: John Doe
Intended Major: Computer Science
GPA: 4.3 (weighted)
Test Score: 1530 SAT
Location: California, United States
Hook: Founded robotics team, won state championship
Results: 8 accepted, 5 rejected

Profile Summary:
Strong CS student with robotics focus, USACO Gold, founded CS club...

---

[Student Profile 2]
...
```

### KB Content Block

```
Relevant Knowledge Base Content

[KB 1] Yale Podcast: Computer Science Internships
Discussion of top CS internship programs including Google STEP, 
Microsoft Explore, and research opportunities...
Source: https://...

---

[KB 2] ...
```

## Configuration Options

### Similar Profiles Search

```typescript
buildSimilarProfilesBlock(profileData, {
  k: 3,                    // Number of similar profiles to retrieve
  maxTotalChars: 2000     // Max characters for the entire block
})
```

### KB Content Search

```typescript
buildKbContextBlock(question, {
  k: 3,                    // Number of KB entries to retrieve
  maxCharsPerChunk: 500,   // Max chars per entry
  maxTotalChars: 1500,     // Max chars for entire block
  header: "Relevant Knowledge Base Content",
  includeMetadata: true
})
```

## Testing

Run the integration test:

```bash
SUPABASE_URL=your_url \
SUPABASE_SERVICE_ROLE_KEY=your_key \
OPENAI_API_KEY=your_key \
bun run tsx scripts/test_similar_profiles_integration.ts
```

This will:
1. Create a test user profile
2. Generate a search query from the profile
3. Retrieve similar student profiles
4. Test question-based KB search
5. Display all results with similarity scores

## Benefits

### For Users
- **Data-Driven Advice**: Recommendations based on real student outcomes
- **Contextual Benchmarking**: See how their profile compares to similar students
- **Pattern Recognition**: Understand what worked for students like them
- **Realistic Expectations**: Know acceptance/rejection rates for similar profiles

### For the AI
- **Grounded Responses**: Can reference actual data rather than generalizations
- **Personalized Insights**: Can draw specific comparisons to similar cases
- **Outcome Awareness**: Knows what schools similar students got into
- **Evidence-Based**: Can cite specific examples from similar profiles

## Future Enhancements

1. **Weighted Similarity**: Weight different profile attributes (GPA vs activities vs awards) differently based on question context

2. **Outcome Filtering**: Allow filtering similar profiles by specific outcomes (e.g., only show students accepted to target schools)

3. **Dynamic K**: Adjust number of retrieved profiles based on user's question type

4. **Profile Diversity**: Ensure retrieved profiles represent diverse outcomes (some with many acceptances, some with rejections)

5. **Temporal Awareness**: Weight recent profiles higher than older ones to account for changing admissions landscape

6. **Major-Specific Search**: Filter similar profiles by intended major when relevant to the question

## Troubleshooting

### No Similar Profiles Found
- Ensure student profiles are properly ingested into the KB
- Check that profiles have `kind: 'student_profile'` in the KB
- Verify user has filled out their profile data

### Poor Profile Matches
- Review the generated search query in console logs
- Check if user profile has sufficient data
- Consider adjusting the similarity threshold

### Context Too Long
- Reduce `k` parameter (number of profiles/KB entries)
- Decrease `maxTotalChars` limits
- Adjust `maxCharsPerChunk` for KB entries

## Related Files

- `scripts/ingest_student_profiles_fixed.ts` - Script that ingested student profiles
- `scripts/test_student_retrieval.ts` - Original retrieval testing
- `supabase/migrations/20251006000000_match_kb.sql` - Vector search function
- `data/Student Profiles Database - Blueprint - student_profiles.csv` - Source data

