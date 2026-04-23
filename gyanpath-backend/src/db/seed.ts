import { getSupabaseAdmin } from '../lib/supabase';
import logger from '../utils/logger';

/**
 * Seed the database with initial data
 */
async function seedDatabase() {
  const supabase = getSupabaseAdmin();

  console.log('🌱 Seeding database...');

  // Seed subjects
  await seedSubjects(supabase);

  // Seed membership plans
  await seedMembershipPlans(supabase);

  // Seed sample quizzes
  await seedQuizzes(supabase);

  // Seed sample materials
  await seedMaterials(supabase);

  console.log('✅ Database seeding complete');
}

async function seedSubjects(supabase: any) {
  const { count } = await supabase
    .from('subjects')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    console.log('Subjects already seeded, skipping...');
    return;
  }

  const subjects = [
    { name: 'mathematics', display_name: 'Mathematics', display_name_hi: 'गणित', icon: '🔢', color: '#4F46E5', sort_order: 1 },
    { name: 'physics', display_name: 'Physics', display_name_hi: 'भौतिक विज्ञान', icon: '⚛️', color: '#0EA5E9', sort_order: 2 },
    { name: 'chemistry', display_name: 'Chemistry', display_name_hi: 'रसायन विज्ञान', icon: '🧪', color: '#10B981', sort_order: 3 },
    { name: 'biology', display_name: 'Biology', display_name_hi: 'जीव विज्ञान', icon: '🧬', color: '#F59E0B', sort_order: 4 },
    { name: 'english', display_name: 'English', display_name_hi: 'अंग्रेज़ी', icon: '📖', color: '#EC4899', sort_order: 5 },
    { name: 'hindi', display_name: 'Hindi', display_name_hi: 'हिंदी', icon: '📝', color: '#8B5CF6', sort_order: 6 },
    { name: 'history', display_name: 'History', display_name_hi: 'इतिहास', icon: '🏛️', color: '#6366F1', sort_order: 7 },
    { name: 'geography', display_name: 'Geography', display_name_hi: 'भूगोल', icon: '🌍', color: '#14B8A6', sort_order: 8 },
    { name: 'computer_science', display_name: 'Computer Science', display_name_hi: 'कंप्यूटर विज्ञान', icon: '💻', color: '#F97316', sort_order: 9 },
    { name: 'general_knowledge', display_name: 'General Knowledge', display_name_hi: 'सामान्य ज्ञान', icon: '💡', color: '#EF4444', sort_order: 10 },
  ];

  const { error } = await supabase.from('subjects').insert(subjects);

  if (error) {
    throw error;
  }

  console.log(`✓ Seeded ${subjects.length} subjects`);
}

async function seedMembershipPlans(supabase: any) {
  const { count } = await supabase
    .from('membership_plans')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    console.log('Membership plans already seeded, skipping...');
    return;
  }

  const plans = [
    {
      name: 'basic',
      display_name: 'Basic',
      description: 'Essential features for regular learners',
      price_inr: 99.00,
      duration_days: 30,
      commission_rate: 0.01,
      benefits: {
        unlimited_quizzes: false,
        daily_quiz_limit: 10,
        ai_insights: false,
        daily_questions: 3,
        material_discount: 0,
        ad_free: false,
      },
      sort_order: 1,
    },
    {
      name: 'premium',
      display_name: 'Premium',
      description: 'Advanced features for serious students',
      price_inr: 299.00,
      duration_days: 30,
      commission_rate: 0.03,
      benefits: {
        unlimited_quizzes: true,
        daily_quiz_limit: null,
        ai_insights: true,
        daily_questions: 10,
        material_discount: 0.15,
        ad_free: true,
        priority_support: true,
        group_creation: true,
        question_upload_limit: 10,
      },
      sort_order: 2,
    },
    {
      name: 'pro',
      display_name: 'Pro Annual',
      description: 'Best value with all features',
      price_inr: 1999.00,
      duration_days: 365,
      commission_rate: 0.05,
      benefits: {
        unlimited_quizzes: true,
        daily_quiz_limit: null,
        ai_insights: true,
        daily_questions: null,
        material_discount: 0.25,
        ad_free: true,
        priority_support: true,
        group_creation: true,
        question_upload_limit: null,
        notes_access: true,
      },
      sort_order: 3,
    },
  ];

  const { error } = await supabase.from('membership_plans').insert(plans);

  if (error) {
    throw error;
  }

  console.log(`✓ Seeded ${plans.length} membership plans`);
}

async function seedQuizzes(supabase: any) {
  const { count } = await supabase
    .from('quizzes')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    console.log('Quizzes already seeded, skipping...');
    return;
  }

  const quizzes = [
    {
      title: 'Daily Mathematics Quiz',
      title_hi: 'दैनिक गणित क्विज़',
      description: 'Test your math skills with daily challenges',
      subject_id: null, // Will be set after getting subject ID
      mode: 'daily',
      difficulty: 'mixed',
      question_count: 10,
      time_limit_seconds: 300,
      passing_score: 60,
      is_official: true,
      is_active: true,
    },
    {
      title: 'Physics Quick Fire',
      title_hi: 'भौतिक विज्ञान क्विक फायर',
      description: 'Fast-paced physics questions',
      subject_id: null,
      mode: 'fast',
      difficulty: 'medium',
      question_count: 15,
      time_limit_seconds: 225,
      passing_score: 60,
      is_official: true,
      is_active: true,
    },
  ];

  // Get subject IDs
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .in('name', ['mathematics', 'physics']);

  const subjectMap = new Map(subjects?.map((s) => [s.name, s.id]));

  quizzes[0].subject_id = subjectMap.get('mathematics');
  quizzes[1].subject_id = subjectMap.get('physics');

  const { error } = await supabase.from('quizzes').insert(quizzes);

  if (error) {
    throw error;
  }

  console.log(`✓ Seeded ${quizzes.length} quizzes`);
}

async function seedMaterials(supabase: any) {
  const { count } = await supabase
    .from('materials')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    console.log('Materials already seeded, skipping...');
    return;
  }

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .in('name', ['mathematics', 'physics', 'chemistry']);

  const subjectMap = new Map(subjects?.map((s) => [s.name, s.id]));

  const materials = [
    {
      title: 'Mathematics Formula Sheet',
      title_hi: 'गणित फॉर्मूला शीट',
      description: 'Complete list of important formulas',
      type: 'pdf',
      subject_id: subjectMap.get('mathematics'),
      class: '10th',
      price_coins: 50,
      price_cash: 29,
      is_premium_only: false,
      is_active: true,
    },
    {
      title: 'Physics Chapter 1 Notes',
      title_hi: 'भौतिक विज्ञान अध्याय 1 नोट्स',
      description: 'Detailed notes for first chapter',
      type: 'notes',
      subject_id: subjectMap.get('physics'),
      class: '12th',
      price_coins: 100,
      price_cash: 49,
      is_premium_only: false,
      is_active: true,
    },
  ];

  const { error } = await supabase.from('materials').insert(materials);

  if (error) {
    throw error;
  }

  console.log(`✓ Seeded ${materials.length} materials`);
}

seedDatabase().catch((error) => {
  logger.error('Seeding failed:', error);
  process.exit(1);
});
