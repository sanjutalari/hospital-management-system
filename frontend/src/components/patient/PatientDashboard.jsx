import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { appointmentService, medicalService, reportService, chatService } from '../../services/api';
import { ChatBox } from '../shared/ChatBox';
import { BookingModal } from './BookingModal';
import { AIHealthAssistant } from './AIHealthAssistant';
import { useNavigate } from 'react-router-dom';
import { generatePrescriptionPDF } from '../../utils/pdfGenerator';
import { 
  Heart, 
  Droplet, 
  Scale, 
  Ruler, 
  AlertTriangle,
  ChevronRight,
  Download,
  Clock,
  Calendar
} from 'lucide-react';

const Sidebar = ({ active, setActive, user, logout }) => {
  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'appointments', icon: '📅', label: 'Appointments' },
    { id: 'records', icon: '📋', label: 'Medical Records' },
    { id: 'reports', icon: '📄', label: 'Reports' },
    { id: 'chat', icon: '💬', label: 'Messages' },
    { id: 'ai-assistant', icon: '✨', label: 'AI Health Assistant' },
    { id: 'profile', icon: '👤', label: 'My Profile' },
  ];

  return (
    <aside className="w-60 min-h-screen bg-[#0f2544] flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-base">🏥</div>
          <div>
            <div className="text-white font-semibold text-sm">HMS</div>
            <div className="text-slate-400 text-xs">Patient Portal</div>
          </div>
        </div>
      </div>
      <div className="mx-3 my-2.5 bg-white/5 rounded-xl px-3 py-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {user.name?.charAt(0)}
        </div>
        <div className="overflow-hidden">
          <div className="text-white text-xs font-medium truncate">{user.name}</div>
          <div className="text-slate-400 text-xs">{user.code || 'Patient'}</div>
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

const StatCard = ({ label, value, change, icon, color }) => (
  <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">{label}</p>
        <p className={`text-3xl font-semibold ${color}`}>{value}</p>
        <p className="text-xs text-emerald-600 mt-1">{change}</p>
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  </div>
);

export const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const { socket, online } = useSocket(user?.id);

  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [reports, setReports] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const [showBook, setShowBook] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const fetchAll = () => {
    appointmentService.myList().then(r => setAppointments(r.data)).catch(() => {});
    medicalService.myRecords().then(r => setRecords(r.data)).catch(() => {});
    reportService.myReports().then(r => setReports(r.data)).catch(() => {});
    chatService.threads().then(r => setConversations(r.data)).catch(() => {});
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const statusBadge = (status) => {
    const map = { PENDING: 'bg-amber-100 text-amber-700', ACCEPTED: 'bg-emerald-100 text-emerald-700', COMPLETED: 'bg-slate-100 text-slate-600', REJECTED: 'bg-red-100 text-red-600', CANCELLED: 'bg-red-100 text-red-600' };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-500'}`}>{status}</span>;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar active={active} setActive={setActive} user={user} logout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-slate-100 h-14 flex items-center justify-between px-7 flex-shrink-0">
          <span className="font-semibold text-base capitalize">{active.replace('-', ' ')}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBook(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95"
            >
              + Book Appointment
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {user.name?.charAt(0)}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7">

          {/* DASHBOARD */}
          {active === 'dashboard' && (
            <div>
              <h2 className="text-xl font-semibold mb-1">Good morning, {user.name?.split(' ')[0]} 👋</h2>
              <p className="text-slate-500 text-sm mb-6">Here's what's happening with your health today.</p>
              <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard label="Appointments" value={appointments.length} change={`${appointments.filter(a => a.status === 'ACCEPTED').length} upcoming`} icon="📅" color="text-blue-600" />
                <StatCard label="Prescriptions" value={records.reduce((acc, r) => acc + (r.prescriptions?.length || 0), 0)} change="Active" icon="💊" color="text-emerald-600" />
                <StatCard label="Reports" value={reports.length} change="Uploaded" icon="📄" color="text-purple-600" />
                <StatCard label="Messages" value={conversations.reduce((a, c) => a + c.unread, 0)} change="Unread" icon="💬" color="text-amber-600" />
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800">Health At A Glance</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                      <Clock size={12} /> Last updated: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-xl mb-2">
                        <Droplet size={20} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Blood Type</p>
                      <p className="text-xl font-bold text-blue-700">{user.bloodType || 'A+'}</p>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl mb-2">
                        <Scale size={20} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Weight</p>
                      <p className="text-xl font-bold text-emerald-700">{user.weight || '72'} <span className="text-xs font-normal">kg</span></p>
                    </div>
                    <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex flex-col items-center text-center">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-xl mb-2">
                        <Ruler size={20} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Height</p>
                      <p className="text-xl font-bold text-purple-700">{user.height || '178'} <span className="text-xs font-normal">cm</span></p>
                    </div>
                    <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex flex-col items-center text-center">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-xl mb-2">
                        <Heart size={20} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">BMI</p>
                      <p className="text-xl font-bold text-amber-700">22.7</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-amber-500">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Health Tip</p>
                        <p className="text-xs text-slate-500">Drink at least 2.5L of water today to stay hydrated.</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
                  <div className="relative z-10">
                    <h4 className="font-bold text-lg mb-1">Upcoming Visit</h4>
                    <p className="text-blue-100 text-xs mb-6">Don't forget your scheduled appointment</p>
                    
                    {appointments.filter(a => a.status === 'ACCEPTED').length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
                            {new Date(appointments.find(a => a.status === 'ACCEPTED').scheduledAt).getDate()}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{appointments.find(a => a.status === 'ACCEPTED').doctor?.user?.name}</p>
                            <p className="text-[11px] text-blue-100">{new Date(appointments.find(a => a.status === 'ACCEPTED').scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · General</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-blue-100 italic">No upcoming visits</p>
                    )}
                  </div>
                  <button className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white text-sm font-bold transition-all relative z-10">
                    Set Reminder
                  </button>
                  <div className="absolute -right-8 -bottom-8 opacity-10">
                    <Calendar size={140} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-sm">Recent Appointments</span>
                    <button onClick={() => setActive('appointments')} className="text-blue-600 text-xs font-medium">View all</button>
                  </div>
                  {appointments.slice(0, 3).map(a => (
                    <div key={a.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-blue-600 leading-none">{new Date(a.scheduledAt).getDate()}</span>
                        <span className="text-xs text-blue-500 uppercase font-semibold">{new Date(a.scheduledAt).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{a.doctor?.user?.name || 'Doctor'}</p>
                        <p className="text-xs text-slate-500">{a.reason || 'Appointment'}</p>
                      </div>
                      {statusBadge(a.status)}
                    </div>
                  ))}
                  {appointments.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No appointments yet</p>}
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-sm">Recent Records</span>
                    <button onClick={() => setActive('records')} className="text-blue-600 text-xs font-medium">View all</button>
                  </div>
                  {records.slice(0, 3).map(r => (
                    <div key={r.id} className="py-3 border-b border-slate-50 last:border-0">
                      <p className="font-semibold text-sm">{r.diagnosis || 'Diagnosis'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.doctor?.user?.name} · {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {records.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No records yet</p>}
                </div>
              </div>
            </div>
          )}

          {/* APPOINTMENTS */}
          {active === 'appointments' && (
            <div>
              <h2 className="text-xl font-semibold mb-1">My Appointments</h2>
              <p className="text-slate-500 text-sm mb-5">Track and manage your doctor visits.</p>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {appointments.length === 0
                  ? <p className="text-slate-400 text-sm text-center py-10">No appointments found.</p>
                  : appointments.map(a => (
                    <div key={a.id} className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 last:border-0">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-blue-600 leading-none">{new Date(a.scheduledAt).getDate()}</span>
                        <span className="text-xs text-blue-500 uppercase font-semibold">{new Date(a.scheduledAt).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{a.doctor?.user?.name || 'Doctor'}</p>
                        <p className="text-xs text-slate-500">{a.reason || 'Appointment'} · {new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(a.status)}
                        <button
                          onClick={() => {
                            setChatPartner({ ...a.doctor.user, role: 'DOCTOR' });
                            setActive('chat');
                          }}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Message Doctor"
                        >
                          💬
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* RECORDS */}
          {active === 'records' && (
            <div>
              <h2 className="text-xl font-semibold mb-1">Medical Records & Prescriptions</h2>
              <p className="text-slate-500 text-sm mb-5">Your complete health history and medications.</p>
              {records.length === 0
                ? <p className="text-slate-400 text-sm">No records found.</p>
                : records.map(r => (
                  <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{r.diagnosis || 'Record'}</span>
                        <button 
                          onClick={() => generatePrescriptionPDF(r)}
                          className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div><p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Doctor</p><p className="text-sm font-medium">{r.doctor?.user?.name}</p></div>
                      {r.symptoms && <div><p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Symptoms</p><p className="text-sm">{r.symptoms}</p></div>}
                      {r.advice && <div className="col-span-2"><p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Advice</p><p className="text-sm">{r.advice}</p></div>}
                    </div>
                    {r.prescriptions?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-2">Prescriptions</p>
                        {r.prescriptions.map(p => (
                          <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 mb-2">
                            <span className="font-medium text-sm">{p.medicineName}</span>
                            <span className="text-xs text-slate-500">{p.dosage} · {p.frequency} · {p.durationDays} days</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setChatPartner({ ...r.doctor.user, role: 'DOCTOR' });
                        setActive('chat');
                      }}
                      className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    >
                      💬 Message Dr. {r.doctor?.user?.name?.split(' ').slice(-1)[0]}
                    </button>
                  </div>
                ))
              }
            </div>
          )}

          {/* REPORTS */}
          {active === 'reports' && (
            <div>
              <h2 className="text-xl font-semibold mb-1">Medical Reports</h2>
              <p className="text-slate-500 text-sm mb-5">Upload, view and share your lab results and scans.</p>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                {reports.length === 0
                  ? <p className="text-slate-400 text-sm text-center py-6">No reports uploaded yet.</p>
                  : reports.map(r => (
                    <div key={r.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-xl">📄</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{r.title}</p>
                        <p className="text-xs text-slate-400">{r.reportType} · {new Date(r.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors">
                        ⬇ View
                      </a>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* CHAT */}
          {active === 'chat' && (
            <div className="h-[calc(100vh-140px)] bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex">
              {/* Contact list */}
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
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {c.partner.name?.charAt(0)}
                        </div>
                        {online[c.partner.id] && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />}
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <p className="font-semibold text-sm">{c.partner.name}</p>
                        <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
                      </div>
                      {c.unread > 0 && <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{c.unread}</span>}
                    </button>
                  ))}
                  {conversations.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No conversations yet</p>}
                </div>
              </div>
              <div className="flex-1">
                <ChatBox partner={chatPartner} socket={socket} online={online} />
              </div>
            </div>
          )}

          {/* AI ASSISTANT */}
          {active === 'ai-assistant' && (
            <AIHealthAssistant />
          )}

          {/* PROFILE */}
          {active === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold mb-5">My Profile</h2>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                    {user.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{user.name}</p>
                    <p className="text-slate-500 text-sm">Patient · {user.code}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Email', value: user.email },
                    { label: 'Role', value: user.role },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-1">{label}</p>
                      <p className="font-medium text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <BookingModal
        isOpen={showBook}
        onClose={() => setShowBook(false)}
        onSuccess={() => {
          fetchAll();
          setActive('appointments');
        }}
      />
    </div>
  );
};
