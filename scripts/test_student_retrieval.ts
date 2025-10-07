/*
  Test Student Profile Retrieval
  
  Usage:
    SUPABASE_URL=... \
    SUPABASE_SERVICE_ROLE_KEY=... \
    OPENAI_API_KEY=... \
    bun run tsx scripts/test_student_retrieval.ts

  Tests the student profile retrieval system with various queries.
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

async function testStudentProfileRetrieval(query: string, filter: Record<string, any> = {}) {
  console.log(`\n🔍 Testing query: "${query}"`);
  console.log(`📋 Filter:`, filter);
  
  try {
    const embedding = await embedQuery(query);
    
    const finalFilter = { kind: 'student_profile', ...filter };
    
    const { data, error } = await (sb as any).rpc('match_kb_chunks', {
      query_embedding: embedding,
      match_count: 3,
      filter: finalFilter,
    });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`✅ Found ${data.length} similar profiles:\n`);
    
    data.forEach((profile: any, index: number) => {
      const metadata = profile.metadata;
      console.log(`${index + 1}. ${metadata.name} - ${metadata.intended_major}`);
      console.log(`   Location: ${metadata.high_school_location}, ${metadata.country}`);
      console.log(`   GPA: ${metadata.gpa_weighted} weighted, Test: ${metadata.test_score} ${metadata.test_type}`);
      console.log(`   Results: ${metadata.accept_count} accepted, ${metadata.reject_count} rejected`);
      console.log(`   Hook: ${metadata.hook_context}`);
      console.log(`   Similarity: ${(profile.similarity * 100).toFixed(1)}%`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error testing retrieval:', error);
  }
}

async function main() {
  console.log('🧪 Testing Student Profile Retrieval System\n');
  
  // Test 1: General CS student query
  await testStudentProfileRetrieval('Computer Science student with high GPA and test scores');
  
  // Test 2: Filter by major
  await testStudentProfileRetrieval('Strong student profile', { intended_major: 'Computer Science' });
  
  // Test 3: Filter by country
  await testStudentProfileRetrieval('US student with good academics', { country: 'United States' });
  
  // Test 4: Business/Finance student
  await testStudentProfileRetrieval('Business student interested in finance and economics');
  
  // Test 5: Engineering student
  await testStudentProfileRetrieval('Engineering student with robotics and STEM activities');
  
  console.log('🎉 Testing complete!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
