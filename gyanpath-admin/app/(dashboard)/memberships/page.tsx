import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function MembershipsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch membership plans
  const { data: plans } = await supabase
    .from('membership_plans')
    .select('*')
    .order('price_monthly', { ascending: true });

  // Fetch active memberships
  const { data: memberships } = await supabase
    .from('user_memberships')
    .select(`
      id,
      status,
      start_date,
      end_date,
      created_at,
      users (
        id,
        email,
        display_name
      ),
      membership_plans (
        name,
        tier
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50);

  // Stats
  const activeMemberships = memberships?.length || 0;
  const planDistribution = plans?.map(plan => ({
    name: plan.name,
    count: memberships?.filter(m => m.membership_plans?.name === plan.name).length || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Memberships</h1>
          <p className="text-sm text-gray-500">Manage membership plans and subscriptions</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
          + New Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Active Plans</p>
          <p className="text-2xl font-bold text-gray-900">{plans?.filter(p => p.is_active).length || 0}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Active Subscriptions</p>
          <p className="text-2xl font-bold text-green-600">{activeMemberships}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Gold Members</p>
          <p className="text-2xl font-bold">{planDistribution?.find(p => p.name.toLowerCase().includes('gold'))?.count || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Platinum Members</p>
          <p className="text-2xl font-bold">{planDistribution?.find(p => p.name.toLowerCase().includes('platinum'))?.count || 0}</p>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Membership Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans?.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-lg border-2 p-6 ${
              plan.tier === 'platinum' ? 'border-gray-400' : 
              plan.tier === 'gold' ? 'border-yellow-400' : 
              'border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{plan.tier} tier</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Monthly</span>
                  <span className="font-semibold">₹{plan.price_monthly}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Yearly</span>
                  <span className="font-semibold">₹{plan.price_yearly}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Commission</span>
                  <span className="font-semibold">{plan.commission_rate}%</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {plan.features?.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  )) || <li className="text-gray-400">No features listed</li>}
                </ul>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  Edit
                </button>
                <button className={`flex-1 px-3 py-2 text-sm rounded ${
                  plan.is_active 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}>
                  {plan.is_active ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Subscriptions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Subscriptions</h2>
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  End Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {memberships?.map((membership) => (
                <tr key={membership.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {membership.users?.display_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {membership.users?.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      membership.membership_plans?.tier === 'platinum' 
                        ? 'bg-gray-200 text-gray-800' 
                        : membership.membership_plans?.tier === 'gold'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {membership.membership_plans?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                      {membership.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(membership.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(membership.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!memberships || memberships.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              No active memberships
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
