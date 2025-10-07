/*
  Debug Student Profiles in Database
*/

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function debugProfiles() {
  console.log('🔍 Debugging student profiles in database...\n');
  
  const { data, error } = await sb
    .from('kb_chunks')
    .select('*')
    .eq('kind', 'student_profile')
    .limit(3);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`Found ${data.length} student profiles:\n`);
  
  data.forEach((profile, index) => {
    console.log(`${index + 1}. ${profile.title}`);
    console.log('Metadata:', JSON.stringify(profile.metadata, null, 2));
    console.log('Body preview:', profile.body.substring(0, 200) + '...');
    console.log('---\n');
  });
}

debugProfiles().catch(console.error);
