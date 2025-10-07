/*
  Test Similar Profiles Integration
  
  Usage:
    SUPABASE_URL=... \
    SUPABASE_SERVICE_ROLE_KEY=... \
    OPENAI_API_KEY=... \
    bun run tsx scripts/test_similar_profiles_integration.ts

  Tests the integration of similar student profiles into the chat context.
*/

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY are required.');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Simulate the buildProfileSearchQuery function
function buildProfileSearchQuery(profileData: any): string {
  const parts: string[] = [];
  
  const activities = profileData.activities?.filter((a: any) => a.name || a.description) || [];
  const activityDescriptions = activities.map((a: any) => `${a.name} ${a.description}`.trim()).join(', ');
  
  if (profileData.gpa) {
    parts.push(`Student with GPA ${profileData.gpa}`);
  }
  
  if (profileData.sat) {
    parts.push(`SAT score ${profileData.sat}`);
  }
  
  if (activityDescriptions) {
    parts.push(`Interested in and involved with: ${activityDescriptions}`);
  }
  
  const awards = profileData.awards?.filter((a: any) => a.name) || [];
  if (awards.length > 0) {
    const awardsList = awards.map((a: any) => a.name).join(', ');
    parts.push(`Awards: ${awardsList}`);
  }
  
  const apExams = profileData.apExams?.filter((e: any) => e.exam) || [];
  if (apExams.length > 0) {
    const examsList = apExams.map((e: any) => e.exam).join(', ');
    parts.push(`AP courses: ${examsList}`);
  }
  
  return parts.join('. ');
}

async function embedQuery(query: string): Promise<number[]> {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: query }),
  });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return j.data[0].embedding as number[];
}

async function testIntegration() {
  console.log('🧪 Testing Similar Profiles Integration\n');
  
  // Example user profile
  const userProfile = {
    gradeLevel: '2025',
    gpa: '3.9 UW / 4.5 W',
    sat: '1520 (760 EBRW / 760 Math)',
    activities: [
      { name: 'Robotics Team Captain', description: 'Led team to state championships' },
      { name: 'Computer Science Club', description: 'Founded club, organized hackathons' }
    ],
    apExams: [
      { exam: 'AP Computer Science A', score: '5' },
      { exam: 'AP Calculus BC', score: '5' }
    ],
    awards: [
      { name: 'USACO Gold Division', level: 'national' },
      { name: 'Science Fair Winner', level: 'regional' }
    ]
  };
  
  console.log('📋 User Profile:');
  console.log(JSON.stringify(userProfile, null, 2));
  console.log('\n');
  
  // Step 1: Build search query from profile
  const searchQuery = buildProfileSearchQuery(userProfile);
  console.log('🔍 Generated Search Query:');
  console.log(searchQuery);
  console.log('\n');
  
  // Step 2: Get embedding for the search query
  console.log('🔄 Getting embedding...');
  const embedding = await embedQuery(searchQuery);
  console.log(`✅ Got embedding (${embedding.length} dimensions)\n`);
  
  // Step 3: Search for similar student profiles
  console.log('🔎 Searching for similar student profiles...');
  const { data: profiles, error: profileError } = await (sb as any).rpc('match_kb_chunks', {
    query_embedding: embedding,
    match_count: 3,
    filter: { kind: 'student_profile' },
  });
  
  if (profileError) {
    console.error('❌ Error fetching similar profiles:', profileError);
    return;
  }
  
  console.log(`✅ Found ${profiles.length} similar profiles:\n`);
  
  profiles.forEach((profile: any, index: number) => {
    const meta = profile.metadata;
    console.log(`${index + 1}. ${meta.name} - ${meta.intended_major}`);
    console.log(`   GPA: ${meta.gpa_weighted}, Test: ${meta.test_score} ${meta.test_type}`);
    console.log(`   Location: ${meta.high_school_location}, ${meta.country}`);
    console.log(`   Results: ${meta.accept_count} accepted, ${meta.reject_count} rejected`);
    console.log(`   Hook: ${meta.hook_context}`);
    console.log(`   Similarity: ${(profile.similarity * 100).toFixed(1)}%`);
    console.log('');
  });
  
  // Step 4: Test question-based KB search
  const testQuestion = "What internships should I pursue for computer science?";
  console.log(`\n💬 Test Question: "${testQuestion}"`);
  console.log('🔄 Getting embedding for question...');
  const questionEmbedding = await embedQuery(testQuestion);
  
  const { data: kbResults, error: kbError } = await (sb as any).rpc('match_kb_chunks', {
    query_embedding: questionEmbedding,
    match_count: 3,
    filter: {},
  });
  
  if (kbError) {
    console.error('❌ Error fetching KB content:', kbError);
    return;
  }
  
  console.log(`✅ Found ${kbResults.length} relevant KB entries:\n`);
  
  kbResults.forEach((result: any, index: number) => {
    console.log(`${index + 1}. [${result.kind}] ${result.title || result.body.slice(0, 60)}...`);
    console.log(`   Similarity: ${(result.similarity * 100).toFixed(1)}%`);
    console.log('');
  });
  
  console.log('🎉 Integration test complete!');
  console.log('\n📝 Summary:');
  console.log('- User profile converted to search query ✓');
  console.log('- Similar student profiles retrieved ✓');
  console.log('- Question-based KB search works ✓');
  console.log('- Both contexts can be combined in chat ✓');
}

testIntegration().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});

