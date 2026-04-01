import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { appointmentService, medicalService, chatService } from '../../services/api';
import { ChatBox } from '../shared/ChatBox';
import { PrescriptionForm } from './PrescriptionForm';
import { useNavigate } from 'react-router-dom';
import { generatePrescriptionPDF } from '../../utils/pdfGenerator';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  Download,
  Stethoscope
} from 'lucide-react';

const Sidebar = ({ active, setActive, user, logout }) => {
  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'appointments', icon: '📅', label: 'Appointments' },
    { id: 'patients', icon: '👥', label: 'My Patients' },
    { id: 'chat', icon: '💬', label: 'Messages' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <aside className="w-60 min-h-screen bg-[#0f2544] flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-base">🏥</div>
          <div>
            <div className="text-white font-semibold text-sm">HMS</div>
            <div className="text-slate-400 text-xs">Doctor Portal</div>
          </div>
        </div>
      </div>
      <div className="mx-3 my-2.5 bg-white/5 rounded-xl px-3 py-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {user.name?.charAt(0)}
        </div>
        <div className="overflow-hidden">
          <div className="text-white text-xs font-medium truncate">{user.name}</div>
          <div className="text-slate-400 text-xs">{user.code || 'Doctor'}</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
              active === item.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-300 text-sm transition-all"
        >
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  );
};

const StatCard = ({ label, value, change, icon: Icon, color, bgColor }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {change && (
            <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight size={10} className="mr-0.5" /> {change}
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-xl ${bgColor} ${color} transition-transform group-hover:scale-110`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const { socket, online } = useSocket(user?.id);

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [showRxForm, setShowRxForm] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const loadData = () => {
    appointmentService.doctorList().then(r => setAppointments(r.data)).catch(() => {});
    medicalService.patientList().then(r => setPatients(r.data)).catch(() => {});
    chatService.threads().then(r => setConversations(r.data)).catch(() => {});
  };

  useEffect(() => { loadData(); }, []);

  const selectPatient = async (p) => {
    setSelectedPatient(p);
    setShowRxForm(false);
    try {
      const { data } = await medicalService.patientFull(p.id);
      setPatientDetail(data);
    } catch {}
  };

  const updateAppt = async (id, status) => {
    try {
      await appointmentService.update(id, { status });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {}
  };

  const statusBadge = (status) => {
    const map = { PENDING: 'bg-amber-100 text-amber-700', ACCEPTED: 'bg-emerald-100 text-emerald-700', COMPLETED: 'bg-slate-100 text-slate-600', REJECTED: 'bg-red-100 text-red-600' };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-500'}`}>{status}</span>;
  };

  const pending = appointments.filter(a => a.status === 'PENDING');
  const todayAppts = appointments.filter(a => {
    const d = new Date(a.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar active={active} setActive={setActive} user={user} logout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-100 h-14 flex items-center justify-between px-7 flex-shrink-0">
          <span className="font-semibold text-base capitalize">{active.replace('-', ' ')}</span>
          <div className="flex items-center gap-3">
            {pending.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {pending.length} pending
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
              {user.name?.charAt(0)}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7">

          {/* DASHBOARD */}
          {active === 'dashboard' && (
            <div>
              <h2 className="text-xl font-semibold mb-1">Good morning, Dr. {user.name?.split(' ').slice(-1)[0]} 👋</h2>
              <p className="text-slate-500 text-sm mb-6">You have {todayAppts.length} appointments today.</p>
              <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard 
                  label="Today's Appointments" 
                  value={todayAppts.length} 
                  change={`${pending.length} pending`} 
                  icon={Calendar} 
                  color="text-blue-600" 
                  bgColor="bg-blue-50"
                />
                <StatCard 
                  label="Total Patients" 
                  value={patients.length} 
                  change="Active" 
                  icon={Users} 
                  color="text-emerald-600" 
                  bgColor="bg-emerald-50"
                />
                <StatCard 
                  label="Pending Actions" 
                  value={pending.length} 
                  change="Action required" 
                  icon={Clock} 
                  color="text-amber-600" 
                  bgColor="bg-amber-50"
                />
                <StatCard 
                  label="Messages" 
                  value={conversations.reduce((a, c) => a + c.unread, 0)} 
                  change="Unread" 
                  icon={MessageSquare} 
                  color="text-purple-600" 
                  bgColor="bg-purple-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-slate-800">Weekly Activity</h3>
                      <p className="text-xs text-slate-400">Number of appointments per day</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <TrendingUp size={16} className="text-slate-400" />
                    </div>
                  </div>
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Mon', count: 4 },
                        { name: 'Tue', count: 7 },
                        { name: 'Wed', count: 5 },
                        { name: 'Thu', count: todayAppts.length + 3 },
                        { name: 'Fri', count: todayAppts.length },
                        { name: 'Sat', count: 2 },
                        { name: 'Sun', count: 0 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#64748b' }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#64748b' }} 
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {[0,1,2,3,4,5,6].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 4 ? '#2563eb' : '#e2e8f0'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="p-3 bg-white/20 rounded-xl w-fit mb-4">
                      <Activity size={24} />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Efficiency Score</h3>
                    <p className="text-blue-100 text-sm mb-4">Your performance is 12% higher than last week!</p>
                    <div className="text-4xl font-bold mb-6">94%</div>
                    <button className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                      View Deep Insights
                    </button>
                  </div>
                  <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
                    <Stethoscope size={160} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <p className="font-semibold text-sm mb-4">Pending Appointments</p>
                  {pending.length === 0
                    ? <p className="text-slate-400 text-sm text-center py-4">No pending appointments</p>
                    : pending.map(a => (
                      <div key={a.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{a.patient?.user?.name}</p>
                          <p className="text-xs text-slate-500">{a.reason} · {new Date(a.scheduledAt).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateAppt(a.id, 'ACCEPTED')} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors">✓ Accept</button>
                          <button onClick={() => updateAppt(a.id, 'REJECTED')} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">✗ Reject</button>
                        </div>
                      </div>
                    ))
                  }
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-sm">Recent Patients</p>
                    <button onClick={() => setActive('patients')} className="text-blue-600 text-xs font-medium">View all</button>
                  </div>
                  {patients.slice(0, 4).map(p => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 rounded-lg px-1 -mx-1 transition-colors" onClick={() => { setActive('patients'); selectPatient(p); }}>
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{p.user?.name?.charAt(0)}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{p.user?.name}</p>
                        <p className="text-xs text-slate-400">{p.patientCode}</p>
                      </div>
                    </div>
                  ))}
                  {patients.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No patients yet</p>}
                </div>
              </div>
            </div>
          )}

          {/* APPOINTMENTS */}
          {active === 'appointments' && (
            <div>
              <h2 className="text-xl font-semibold mb-1">All Appointments</h2>
              <p className="text-slate-500 text-sm mb-5">Manage appointment requests and status.</p>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Patient</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Date &amp; Time</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Reason</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Actions</th>
                  </tr></thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-medium">{a.patient?.user?.name || '—'}</td>
                        <td className="px-5 py-4 text-slate-500">{new Date(a.scheduledAt).toLocaleString()}</td>
                        <td className="px-5 py-4 text-slate-500">{a.reason || '—'}</td>
                        <td className="px-5 py-4">{statusBadge(a.status)}</td>
                        <td className="px-5 py-4">
                          {a.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button onClick={() => updateAppt(a.id, 'ACCEPTED')} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">Accept</button>
                              <button onClick={() => updateAppt(a.id, 'REJECTED')} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-semibold">Reject</button>
                            </div>
                          )}
                          {a.status === 'ACCEPTED' && (
                            <button onClick={() => updateAppt(a.id, 'COMPLETED')} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">Complete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {appointments.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No appointments found</p>}
              </div>
            </div>
          )}

          {/* PATIENTS */}
          {active === 'patients' && (
            <div>
              <h2 className="text-xl font-semibold mb-1">My Patients</h2>
              <p className="text-slate-500 text-sm mb-5">Click a patient to view details and add records.</p>
              <div className="grid grid-cols-2 gap-5 h-[calc(100vh-200px)]">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-y-auto">
                  {patients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => selectPatient(p)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 transition-colors ${selectedPatient?.id === p.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">{p.user?.name?.charAt(0)}</div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{p.user?.name}</p>
                        <p className="text-xs text-slate-400">{p.patientCode} · Last: {p.appointments?.[0] ? new Date(p.appointments[0].scheduledAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </button>
                  ))}
                  {patients.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No patients yet</p>}
                </div>
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-y-auto p-5">
                  {!selectedPatient
                    ? <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <div className="text-5xl mb-3">👤</div>
                        <p className="font-medium">Select a patient to view details</p>
                      </div>
                    : patientDetail
                      ? <div>
                          <div className="flex items-center justify-between gap-4 mb-5">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">{patientDetail.user?.name?.charAt(0)}</div>
                              <div>
                                <p className="text-lg font-semibold">{patientDetail.user?.name}</p>
                                <p className="text-slate-500 text-sm">{patientDetail.patientCode} · {patientDetail.user?.email}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setChatPartner({ ...patientDetail.user, role: 'PATIENT' });
                                setActive('chat');
                              }}
                              className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all shadow-sm flex items-center gap-2 font-semibold text-sm"
                              title="Message Patient"
                            >
                              💬 Message
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            {patientDetail.age && <div><p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Age</p><p className="font-medium text-sm">{patientDetail.age}</p></div>}
                            {patientDetail.bloodType && <div><p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Blood Type</p><p className="font-medium text-sm">{patientDetail.bloodType}</p></div>}
                          </div>
                          <button
                            onClick={() => setShowRxForm(prev => !prev)}
                            className="w-full py-2.5 mb-4 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                          >
                            {showRxForm ? 'Close Form' : '+ Add Medical Record'}
                          </button>
                          {showRxForm && (
                            <PrescriptionForm
                              patient={patientDetail}
                              onSuccess={() => { setShowRxForm(false); selectPatient(selectedPatient); }}
                            />
                          )}
                          {patientDetail.records?.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-3">Medical History</p>
                              {patientDetail.records.map(r => (
                                <div key={r.id} className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm">{r.diagnosis}</p>
                                    <button 
                                      onClick={() => generatePrescriptionPDF({ ...r, patient: patientDetail })}
                                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                      title="Download PDF"
                                    >
                                      <Download size={14} />
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      : <p className="text-slate-400 text-sm text-center py-8">Loading…</p>
                  }
                </div>
              </div>
            </div>
          )}

          {/* CHAT */}
          {active === 'chat' && (
            <div className="h-[calc(100vh-140px)] bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex">
              <div className="w-72 border-r border-slate-100 flex flex-col">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Conversations</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {conversations.map(c => (
                    <button
                      key={c.partner.id}
                      onClick={() => setChatPartner(c.partner)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 transition-colors ${chatPartner?.id === c.partner.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">{c.partner.name?.charAt(0)}</div>
                        {online[c.partner.id] && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />}
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <p className="font-semibold text-sm">{c.partner.name}</p>
                        <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
                      </div>
                      {c.unread > 0 && <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{c.unread}</span>}
                    </button>
                  ))}
                  {conversations.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No conversations</p>}
                </div>
              </div>
              <div className="flex-1">
                <ChatBox partner={chatPartner} socket={socket} online={online} />
              </div>
            </div>
          )}

          {/* PROFILE */}
          {active === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold mb-5">My Profile</h2>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold">{user.name?.charAt(0)}</div>
                  <div>
                    <p className="text-2xl font-semibold">{user.name}</p>
                    <p className="text-slate-500 text-sm">Doctor · {user.code}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-1">Email</p><p className="font-medium text-sm">{user.email}</p></div>
                  <div><p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-1">Role</p><p className="font-medium text-sm">{user.role}</p></div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
