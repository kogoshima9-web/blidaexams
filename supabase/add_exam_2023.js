require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const questions = JSON.parse(fs.readFileSync('supabase/pharmaco_2023_questions.json', 'utf-8'));

async function addExam2023() {
    console.log('Adding Pharmacologie EMD 2023 exam...\n');

    // Get 3rd year ID and Pharmacologie subject
    const { data: years } = await supabase.from('school_years').select('id, short_label');
    const year3 = years.find(y => y.short_label === '3ème');
    
    const { data: subjects } = await supabase.from('subjects').select('id, name');
    let pharmaco = subjects.find(s => s.name === 'Pharmacologie');
    
    console.log(`Year 3: ${year3.id}`);
    console.log(`Pharmacologie: ${pharmaco?.id}`);
    
    // Check if exam already exists
    const { data: existing } = await supabase
        .from('exams')
        .select('id')
        .eq('year', 2023)
        .eq('subject_id', pharmaco.id)
        .eq('school_year_id', year3.id)
        .single();
    
    if (existing) {
        console.log('Exam already exists, deleting...');
        await supabase.from('questions').delete().eq('exam_id', existing.id);
        await supabase.from('exams').delete().eq('id', existing.id);
    }

    // Insert exam
    const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert({
            university: 'Université de Constantine',
            year: 2023,
            exam_type: 'EMD',
            school_year_id: year3.id,
            subject_id: pharmaco.id,
            is_published: true,
        })
        .select()
        .single();

    if (examError) {
        console.error('Error inserting exam:', examError);
        return;
    }
    console.log(`Created exam: ${exam.id}`);

    // Insert questions in batches
    const questionsToInsert = questions.map((q, index) => ({
        exam_id: exam.id,
        question_order: index + 1,
        question_text: q.text,
        options: q.options,
        correct_answer: q.correctAnswer,
    }));

    for (let i = 0; i < questionsToInsert.length; i += 20) {
        const batch = questionsToInsert.slice(i, i + 20);
        const { error: qError } = await supabase.from('questions').insert(batch);
        if (qError) console.error(`Error batch ${i}:`, qError);
    }

    console.log(`\nExam added: Université de Constantine 2023 EMD - ${questions.length} questions`);
    console.log(`Exam ID: ${exam.id}`);
}

addExam2023().catch(console.error);
