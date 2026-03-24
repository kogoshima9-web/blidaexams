require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const map = { A: 0, B: 1, C: 2, D: 3, E: 4 };
const answers = {
  1: 'AD', 2: 'E', 3: 'BD', 4: 'AC', 5: 'BC', 6: 'CDE', 7: 'BC', 8: 'CE', 9: 'ADE',
  10: 'BE', 11: 'C', 12: 'D', 13: 'AE', 14: 'CD', 15: 'ABC', 16: 'AE', 17: 'BE',
  18: 'AE', 19: 'AB', 20: 'CD', 21: 'ABC', 22: 'BDE', 23: 'DE', 24: 'AC', 25: 'BD',
  26: 'AC', 27: 'CD', 28: 'A', 29: 'C', 30: 'D', 31: 'BC', 32: 'D', 33: 'B', 34: 'CDE', 35: 'CDE'
};

async function fix() {
  const { data: exams } = await supabase
    .from('exams')
    .select('id, year, university, subject_id')
    .eq('year', 2023);

  console.log('Exams found:', exams?.length);
  if (!exams || exams.length === 0) return;

  const examId = exams[0].id;
  const { data: qs } = await supabase
    .from('questions')
    .select('id, question_order')
    .eq('exam_id', examId)
    .order('question_order');

  console.log('Updating', qs.length, 'questions...');

  for (const q of qs) {
    const ansStr = answers[q.question_order];
    if (!ansStr) { console.log('Missing answer for Q' + q.question_order); continue; }
    const indices = ansStr.split('').map(l => map[l]);
    const { error } = await supabase
      .from('questions')
      .update({ correct_answer: indices[0], correct_answers: indices })
      .eq('id', q.id);
    if (error) console.log('Error Q' + q.question_order + ':', error.message);
  }

  console.log('All questions updated with correct_answers arrays!');

  // Verify
  const { data: verify } = await supabase
    .from('questions')
    .select('id, question_order, correct_answer, correct_answers')
    .eq('exam_id', examId)
    .order('question_order')
    .limit(5);
  console.log('\nSample:');
  verify?.forEach(q => {
    const letters = q.correct_answers?.map(i => String.fromCharCode(65 + i)).join('');
    console.log(`  Q${q.question_order}: index=${q.correct_answer} array=${JSON.stringify(q.correct_answers)} letters=${letters}`);
  });
}

fix().catch(console.error);
