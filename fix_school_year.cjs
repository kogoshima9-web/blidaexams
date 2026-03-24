const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing vars:', { url: !!supabaseUrl, key: !!supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data: years, error: yErr } = await supabase
    .from('school_years')
    .select('id, name, display_order')
    .order('display_order');
  
  if (yErr) { console.error('Error fetching years:', yErr); return; }
  
  console.log('School years:');
  years?.forEach(y => console.log(`  ${y.name}: ${y.id}`));
  
  const troisieme = years?.find(y => y.display_order === 3);
  console.log('\n3ème Année ID:', troisieme?.id);
  
  if (!troisieme) { console.error('Not found!'); return; }
  
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, school_year_id');
  
  console.log('\nSubjects:');
  subjects?.forEach(s => console.log(`  ${s.name}: ${s.school_year_id}`));
  
  const validIds = new Set(years?.map(y => y.id));
  const orphaned = subjects?.filter(s => !validIds.has(s.school_year_id)) || [];
  
  console.log('\nOrphaned subjects:', orphaned.map(s => s.name));
  
  for (const sub of orphaned) {
    const { error } = await supabase
      .from('subjects')
      .update({ school_year_id: troisieme.id })
      .eq('id', sub.id);
    if (error) console.error(`Error: ${error.message}`);
    else console.log(`Fixed: ${sub.name}`);
  }
  
  const { data: exams } = await supabase
    .from('exams')
    .select('id, university, year, school_year_id');
  
  const orphanedExams = exams?.filter(e => !validIds.has(e.school_year_id)) || [];
  console.log('Orphaned exams:', orphanedExams.map(e => `${e.university} ${e.year}`));
  
  for (const exam of orphanedExams) {
    const { error } = await supabase
      .from('exams')
      .update({ school_year_id: troisieme.id })
      .eq('id', exam.id);
    if (error) console.error(`Error: ${error.message}`);
    else console.log(`Fixed: ${exam.university} ${exam.year}`);
  }
}

fix();
