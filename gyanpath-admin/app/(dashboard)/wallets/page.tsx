import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function WalletsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch wallets with user info
  const { data: wallets } = await supabase
    .from('wallets')
    .select(`
      id,
      balance,
      total_earned,
      total_spent,
      created_at,
      users (
        id,
        email,
        display_name,
        role
      )
    `)
    .order('balance', { ascending: false })
    .limit(100);

  // Calculate totals
  const totalBalance = wallets?.reduce((sum, w) => sum + w.balance, 0) || 0;
  const totalEarned = wallets?.reduce((sum, w) => sum + (w.total_earned || 0), 0) || 0;
  const totalSpent = wallets?.reduce((sum, w) => sum + (w.total_spent || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallets</h1>
          <p className="text-sm text-gray-500">Manage user coin wallets</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
          + Bulk Credit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Wallets</p>
          <p className="text-2xl font-bold text-gray-900">{wallets?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Balance</p>
          <p className="text-2xl font-bold text-indigo-600">{totalBalance.toLocaleString()} 🪙</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Earned</p>
          <p className="text-2xl font-bold text-green-600">{totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-red-600">{totalSpent.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by email or name..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          />
          <select className="px-3 py-2 border rounded-lg text-sm">
            <option value="">Sort by Balance</option>
            <option value="earned">Sort by Earned</option>
            <option value="spent">Sort by Spent</option>
            <option value="recent">Recently Active</option>
          </select>
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Earned
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {wallets?.map((wallet) => (
              <tr key={wallet.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {wallet.users?.display_name || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {wallet.users?.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    wallet.users?.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {wallet.users?.role || 'student'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-bold text-indigo-600">
                    {wallet.balance.toLocaleString()} 🪙
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                  +{(wallet.total_earned || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                  -{(wallet.total_spent || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <button className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                      Credit
                    </button>
                    <button className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">
                      Debit
                    </button>
                    <button className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      History
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!wallets || wallets.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            No wallets found
          </div>
        )}
      </div>
    </div>
  );
}
