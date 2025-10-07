/*
  Student Profile Ingestion Script
  
  Usage:
    SUPABASE_URL=... \
    SUPABASE_SERVICE_ROLE_KEY=... \
    OPENAI_API_KEY=... \
    bun run tsx scripts/ingest_student_profiles.ts

  Ingests student profiles from CSV into the vector database for RAG retrieval.
*/

import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const INPUT_PATH = process.env.INPUT_PATH || './data/Student Profiles Database - Blueprint - student_profiles.csv';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY are required.');
  process.exit(1);
}

type StudentProfile = {
  profile_id: string;
  name: string;
  country: string;
  state_province: string;
  high_school_type: string;
  high_school_name: string;
  high_school_location: string;
  gpa_unweighted: number;
  gpa_weighted: number;
  test_type: string;
  test_score: number;
  coursework_rigor: string;
  ap_ib_hl_count: number;
  intended_major: string;
  secondary_interests: string;
  hook_context: string;
  overall_strength_bucket: string;
  accept_count: number;
  reject_count: number;
  waitlist_count: number;
  activities: string;
  awards: string;
  decisions_compact: string;
  narrative_summary: string;
  created_at: string;
};

type KbRow = {
  kind: string;
  title: string | null;
  body: string;
  metadata: Record<string, any>;
  embedding?: number[];
};

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function embedBatch(inputs: string[]): Promise<number[][]> {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: inputs }),
  });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return j.data.map((d: any) => d.embedding as number[]);
}

function parseCSV(csvContent: string): StudentProfile[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const profile: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      
      // Parse numeric fields
      if (['gpa_unweighted', 'gpa_weighted', 'test_score', 'ap_ib_hl_count', 'accept_count', 'reject_count', 'waitlist_count'].includes(header)) {
        profile[header] = value ? parseFloat(value) : 0;
      } else {
        profile[header] = value;
      }
    });
    
    return profile as StudentProfile;
  });
}

function createProfileEmbeddingText(profile: StudentProfile): string {
  const parts = [
    `Student: ${profile.name}`,
    `Location: ${profile.high_school_location}, ${profile.country}`,
    `High School: ${profile.high_school_name} (${profile.high_school_type})`,
    `Intended Major: ${profile.intended_major}`,
    `Secondary Interests: ${profile.secondary_interests}`,
    `GPA: ${profile.gpa_unweighted} unweighted, ${profile.gpa_weighted} weighted`,
    `Test Score: ${profile.test_score} ${profile.test_type}`,
    `Coursework Rigor: ${profile.coursework_rigor}`,
    `AP/IB/HL Count: ${profile.ap_ib_hl_count}`,
    `Hook Context: ${profile.hook_context}`,
    `Overall Strength: ${profile.overall_strength_bucket}`,
    `Activities: ${profile.activities}`,
    `Awards: ${profile.awards}`,
    `Admission Results: ${profile.accept_count} accepted, ${profile.reject_count} rejected, ${profile.waitlist_count} waitlisted`,
    `Decisions: ${profile.decisions_compact}`,
    `Summary: ${profile.narrative_summary}`
  ];
  
  return parts.join('\n');
}

function mapStudentProfile(profile: StudentProfile): KbRow {
  const embeddingText = createProfileEmbeddingText(profile);
  
  return {
    kind: 'student_profile',
    title: `${profile.name} - ${profile.intended_major} (${profile.country})`,
    body: embeddingText,
    metadata: {
      profile_id: profile.profile_id,
      name: profile.name,
      country: profile.country,
      state_province: profile.state_province,
      high_school_type: profile.high_school_type,
      high_school_name: profile.high_school_name,
      high_school_location: profile.high_school_location,
      gpa_unweighted: profile.gpa_unweighted,
      gpa_weighted: profile.gpa_weighted,
      test_type: profile.test_type,
      test_score: profile.test_score,
      coursework_rigor: profile.coursework_rigor,
      ap_ib_hl_count: profile.ap_ib_hl_count,
      intended_major: profile.intended_major,
      secondary_interests: profile.secondary_interests,
      hook_context: profile.hook_context,
      overall_strength_bucket: profile.overall_strength_bucket,
      accept_count: profile.accept_count,
      reject_count: profile.reject_count,
      waitlist_count: profile.waitlist_count,
      activities: profile.activities,
      awards: profile.awards,
      decisions_compact: profile.decisions_compact,
      narrative_summary: profile.narrative_summary,
      created_at: profile.created_at
    }
  };
}

async function main() {
  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(INPUT_PATH, 'utf-8');
  
  console.log('Parsing CSV...');
  const profiles = parseCSV(csvContent);
  console.log(`Found ${profiles.length} student profiles`);
  
  console.log('Mapping profiles...');
  const kbRows = profiles.map(mapStudentProfile);
  
  console.log('Generating embeddings...');
  const batchSize = 64;
  const batches = [];
  
  for (let i = 0; i < kbRows.length; i += batchSize) {
    const batch = kbRows.slice(i, i + batchSize);
    const embeddings = await embedBatch(batch.map(row => row.body));
    
    const rowsWithEmbeddings = batch.map((row, index) => ({
      ...row,
      embedding: embeddings[index]
    }));
    
    batches.push(rowsWithEmbeddings);
  }
  
  console.log('Inserting into database...');
  for (const batch of batches) {
    const { error } = await sb.from('kb_chunks').insert(batch);
    if (error) {
      console.error('Insert error:', error);
      process.exitCode = 1;
      return;
    }
    console.log(`Inserted batch of ${batch.length} profiles`);
  }
  
  console.log('Student profile ingestion complete!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
