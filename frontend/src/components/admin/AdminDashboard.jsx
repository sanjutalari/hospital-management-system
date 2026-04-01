import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Activity, 
  ArrowUpRight, 
  Settings,
  LogOut,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Database,
  Calendar,
  FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({ active, setActive, user, logout }) => {
  const navItems = [
    { id: 'dashboard', icon: Activity, label: 'System Overview' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'settings', icon: Settings, label: 'System Settings' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col shadow-2xl">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">HMS Admin</div>
            <div className="text-blue-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">Control Center</div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              active === item.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="mb-4 flex items-center gap-3 bg-white/5 p-3 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {user.name?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-bold truncate">{user.name}</p>
            <p className="text-slate-500 text-[10px] uppercase">Administrator</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition-all"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform", color)}>
        <Icon size={22} />
      </div>
      {trend && (
        <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <ArrowUpRight size={10} className="mr-0.5" /> {trend}
        </span>
      )}
    </div>
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sRes, uRes] = await Promise.all([
        adminService.getStats(),
        adminService.listUsers()
      ]);
      setStats(sRes.data.stats);
      setUsers(uRes.data.users);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleUser = async (id) => {
    try {
      await adminService.toggleUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      alert('Failed to toggle user status');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans antialiased text-slate-900">
      <Sidebar active={active} setActive={setActive} user={user} logout={handleLogout} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <h1 className="text-xl font-black tracking-tight capitalize">
            {active.replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-100 rounded-2xl flex items-center gap-2">
              <Database size={16} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">System: Operational</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          {active === 'dashboard' && stats && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6">
                <MetricCard 
                  label="Total Users" 
                  value={users.length} 
                  icon={Users} 
                  color="bg-blue-50 text-blue-600" 
                  trend="+12%" 
                />
                <MetricCard 
                  label="Doctors" 
                  value={stats.doctors} 
                  icon={Shield} 
                  color="bg-emerald-50 text-emerald-600" 
                  trend="+2" 
                />
                <MetricCard 
                  label="Appointments" 
                  value={stats.appointments} 
                  icon={Calendar} 
                  color="bg-amber-50 text-amber-600" 
                  trend="+5%" 
                />
                <MetricCard 
                  label="Medical Records" 
                  value={stats.reports} 
                  icon={FileText} 
                  color="bg-purple-50 text-purple-600" 
                  trend="+18%" 
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-black text-slate-900">Registration Trends</h3>
                      <p className="text-sm text-slate-400 font-medium">Monthly new user registrations</p>
                    </div>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Jan', count: 40 },
                        { name: 'Feb', count: 30 },
                        { name: 'Mar', count: 50 },
                        { name: 'Apr', count: 45 },
                        { name: 'May', count: 60 },
                        { name: 'Jun', count: 55 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {[0,1,2,3,4,5].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 5 ? '#2563eb' : '#e2e8f0'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                  <h3 className="font-black text-slate-900 mb-8">Role Distribution</h3>
                  <div className="h-56 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Patients', value: stats.patients },
                            { name: 'Doctors', value: stats.doctors },
                            { name: 'Admins', value: users.filter(u=>u.role==='ADMIN').length },
                          ]}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#2563eb" />
                          <Cell fill="#10b981" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                       <p className="text-2xl font-black text-slate-900">{users.length}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                    </div>
                  </div>
                  <div className="space-y-3 mt-6">
                    {[
                      { label: 'Patients', color: 'bg-blue-600', val: stats.patients },
                      { label: 'Doctors', color: 'bg-emerald-500', val: stats.doctors },
                      { label: 'Admins', color: 'bg-amber-500', val: users.filter(u=>u.role==='ADMIN').length },
                    ].map(role => (
                      <div key={role.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", role.color)} />
                          <span className="text-xs font-bold text-slate-600">{role.label}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{role.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === 'users' && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom duration-500">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search users by name or email..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors text-slate-500">
                    <Filter size={18} />
                  </button>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                    + Add New User
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            u.role === 'ADMIN' ? "bg-amber-100 text-amber-600" :
                            u.role === 'DOCTOR' ? "bg-emerald-100 text-emerald-600" :
                            "bg-blue-100 text-blue-600"
                          )}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-slate-500 font-medium">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                             {u.isActive ? (
                               <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                                 <CheckCircle2 size={12} /> Active
                               </div>
                             ) : (
                               <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                                 <XCircle size={12} /> Deactivated
                               </div>
                             )}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleUser(u.id)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                                u.isActive 
                                  ? "bg-red-50 text-red-500 hover:bg-red-100" 
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              )}
                            >
                              {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
