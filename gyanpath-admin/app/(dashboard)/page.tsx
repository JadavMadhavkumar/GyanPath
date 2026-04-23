import { createClient } from '@/utils/supabase/server';
import { formatCurrency, formatNumber } from '@/lib/utils';

async function getStats() {
  const supabase = await createClient();
  
  const today = new Date().toISOString().split('T')[0];
  
  // Get counts
  const [usersResult, questionsResult, transactionsResult] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('payment_transactions').select('amount_paisa').eq('status', 'captured'),
  ]);

  const totalRevenue = transactionsResult.data?.reduce((sum, t) => sum + (t.amount_paisa || 0), 0) || 0;

  return {
    totalUsers: usersResult.count || 0,
    pendingQuestions: questionsResult.count || 0,
    totalRevenue: totalRevenue / 100, // Convert paisa to rupees
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Pending Questions"
          value={formatNumber(stats.pendingQuestions)}
          icon="❓"
          color="yellow"
          href="/(dashboard)/questions"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Active Quizzes"
          value="0"
          icon="📝"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <ActionButton href="/(dashboard)/questions" icon="✅" label="Review Questions" />
          <ActionButton href="/(dashboard)/users" icon="👤" label="Manage Users" />
          <ActionButton href="/(dashboard)/transactions" icon="📊" label="View Transactions" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-gray-500 text-center py-8">
          <p>No recent activity</p>
          <p className="text-sm">Activity logs will appear here</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  href,
}: {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  href?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-2xl p-2 rounded-lg ${colorClasses[color]}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );

  if (href) {
    return <a href={href} className="block hover:scale-105 transition-transform">{content}</a>;
  }

  return content;
}

function ActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
    >
      <span>{icon}</span>
      {label}
    </a>
  );
}
