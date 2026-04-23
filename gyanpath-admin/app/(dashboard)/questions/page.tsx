import { createClient } from '@/utils/supabase/server';
import { formatDate } from '@/lib/utils';

async function getPendingQuestions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      subject:subjects(name, display_name),
      created_by:users(id, full_name, email)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return data || [];
}

export default async function QuestionsPage() {
  const questions = await getPendingQuestions();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Review</h1>
          <p className="text-gray-500">{questions.length} questions pending approval</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-1">No questions pending review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question: any) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionCard({ question }: { question: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            question.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {question.difficulty}
          </span>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {question.subject?.display_name || 'Unknown Subject'}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {formatDate(question.created_at)}
        </span>
      </div>

      <p className="text-lg text-gray-900 mb-4">{question.question_text}</p>

      {question.question_text_hi && (
        <p className="text-gray-600 mb-4 italic">{question.question_text_hi}</p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        {(question.options || []).map((option: any, index: number) => (
          <div
            key={option.id}
            className={`p-3 rounded-lg border ${
              option.id === question.correct_option_id
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <span className="font-medium text-gray-700">
              {String.fromCharCode(65 + index)}.{' '}
            </span>
            {option.text}
            {option.id === question.correct_option_id && (
              <span className="ml-2 text-green-600">✓</span>
            )}
          </div>
        ))}
      </div>

      {question.explanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Explanation:</strong> {question.explanation}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-500">
          Submitted by: <span className="font-medium">{question.created_by?.full_name || 'Unknown'}</span>
        </div>
        <div className="flex gap-2">
          <form action={`/api/questions/${question.id}/reject`} method="POST">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              Reject
            </button>
          </form>
          <form action={`/api/questions/${question.id}/approve`} method="POST">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Approve
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
