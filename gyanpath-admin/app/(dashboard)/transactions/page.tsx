import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function TransactionsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch recent transactions
  const { data: transactions, error } = await supabase
    .from('wallet_transactions')
    .select(`
      id,
      type,
      amount,
      source,
      description,
      created_at,
      wallets (
        users (
          id,
          email,
          display_name
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  // Calculate stats
  const credits = transactions?.filter(t => t.type === 'credit') || [];
  const debits = transactions?.filter(t => t.type === 'debit' || t.type === 'purchase') || [];
  const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500">Monitor all wallet transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{transactions?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Credits</p>
          <p className="text-2xl font-bold text-green-600">+{totalCredits.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Debits</p>
          <p className="text-2xl font-bold text-red-600">-{totalDebits.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Net Flow</p>
          <p className={`text-2xl font-bold ${totalCredits - totalDebits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(totalCredits - totalDebits).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap gap-4">
          <select className="px-3 py-2 border rounded-lg text-sm">
            <option value="">All Types</option>
            <option value="credit">Credits</option>
            <option value="debit">Debits</option>
            <option value="purchase">Purchases</option>
          </select>
          <select className="px-3 py-2 border rounded-lg text-sm">
            <option value="">All Sources</option>
            <option value="quiz_reward">Quiz Rewards</option>
            <option value="coin_purchase">Coin Purchases</option>
            <option value="material_purchase">Material Purchases</option>
            <option value="manual_credit">Manual Credits</option>
          </select>
          <input
            type="date"
            className="px-3 py-2 border rounded-lg text-sm"
            placeholder="From date"
          />
          <input
            type="date"
            className="px-3 py-2 border rounded-lg text-sm"
            placeholder="To date"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions?.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString()}{' '}
                  <span className="text-gray-400">
                    {new Date(transaction.created_at).toLocaleTimeString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.wallets?.users?.display_name || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.wallets?.users?.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    transaction.type === 'credit'
                      ? 'bg-green-100 text-green-800'
                      : transaction.type === 'debit'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.source?.replace(/_/g, ' ')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={`text-sm font-semibold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}
                    {transaction.amount.toLocaleString()} 🪙
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!transactions || transactions.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
}
