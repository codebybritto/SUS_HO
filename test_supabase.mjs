import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqgpxlydbijpujjnntci.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZ3B4bHlkYmlqcHVqam5udGNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDM2MTM2OSwiZXhwIjoyMTA1OTM3MzY5fQ.0mf0xcclTQPiQLjMlDG6oeN_JJQQAOH60q_XLxUqZRw';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  console.log('Testing connection to Supabase...');
  const { data, error } = await supabase.from('units').select('*').limit(5);
  if (error) {
    console.log('Query to units returned error:', error.message, error.code);
  } else {
    console.log('Query to units succeeded! Found rows:', data?.length);
  }

  const { data: pData, error: pError } = await supabase.from('patients').select('*').limit(5);
  if (pError) {
    console.log('Query to patients returned error:', pError.message, pError.code);
  } else {
    console.log('Query to patients succeeded! Found rows:', pData?.length);
  }
}

check();
