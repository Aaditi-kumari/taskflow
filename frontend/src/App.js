import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const api = (token) => axios.create({
  baseURL: API,
  headers: { Authorization: `Bearer ${token}` }
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [page, setPage] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Member');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', desc: '', color: '#667eea' });
  const [newTask, setNewTask] = useState({ title: '', project_id: '', assignee_id: '', priority: 'Med', due_date: '' });

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const a = api(token);
      const [p, t] = await Promise.all([a.get('/projects'), a.get('/tasks')]);
      setProjects(p.data);
      setTasks(t.data);
      if (user?.role === 'Admin') {
        const u = await a.get('/users');
        setUsers(u.data);
      }
    } catch (err) { console.log(err); }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    } catch { setError('Invalid credentials!'); }
  };

  const signup = async () => {
    try {
      const res = await axios.post(`${API}/auth/signup`, { name, email, password, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    } catch { setError('Signup failed!'); }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  const createProject = async () => {
    try {
      await api(token).post('/projects', newProject);
      setNewProject({ name: '', desc: '', color: '#667eea' });
      setShowProjectForm(false);
      fetchData();
    } catch (err) { alert('Error creating project'); }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await api(token).delete(`/projects/${id}`);
    fetchData();
  };

  const createTask = async () => {
    try {
      await api(token).post('/tasks', newTask);
      setNewTask({ title: '', project_id: '', assignee_id: '', priority: 'Med', due_date: '' });
      setShowTaskForm(false);
      fetchData();
    } catch (err) { alert('Error creating task'); }
  };

  const updateTaskStatus = async (id, status) => {
    await api(token).patch(`/tasks/${id}`, { status });
    fetchData();
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api(token).delete(`/tasks/${id}`);
    fetchData();
  };

  if (!token) return (
    <div style={s.authBg}>
      <div style={s.authBox}>
        <h1 style={s.logo}>⚡ TaskFlow</h1>
        <p style={s.subtitle}>{isSignup ? 'Create Account' : 'Welcome Back'}</p>
        {error && <p style={s.error}>{error}</p>}
        {isSignup && <>
          <input style={s.input} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
          <select style={s.input} value={role} onChange={e => setRole(e.target.value)}>
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
        </>}
        <input style={s.input} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={s.input} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={s.btn} onClick={isSignup ? signup : login}>{isSignup ? 'Sign Up' : 'Login'}</button>
        <p style={s.toggle} onClick={() => { setIsSignup(!isSignup); setError(''); }}>
          {isSignup ? 'Already have account? Login' : "Don't have account? Sign Up"}
        </p>
      </div>
    </div>
  );

  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Done').length;

  return (
    <div style={s.app}>
      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <h2 style={s.logo2}>⚡ TaskFlow</h2>
        <div style={s.userCard}>
          <div style={s.avatar}>{user?.name?.[0]}</div>
          <div>
            <p style={s.userName}>{user?.name}</p>
            <p style={s.userRole}>{user?.role}</p>
          </div>
        </div>
        {['dashboard','projects','tasks', ...(user?.role==='Admin'?['team']:[])].map(p => (
          <button key={p} style={page===p ? s.navActive : s.nav} onClick={() => setPage(p)}>
            {p==='dashboard'?'📊':p==='projects'?'📁':p==='tasks'?'✅':'👥'} {p.charAt(0).toUpperCase()+p.slice(1)}
          </button>
        ))}
        <button style={s.logoutBtn} onClick={logout}>🚪 Logout</button>
      </div>

      {/* MAIN */}
      <div style={s.main}>

        {/* DASHBOARD */}
        {page === 'dashboard' && (
          <div>
            <h1 style={s.pageTitle}>Dashboard</h1>
            <div style={s.statsRow}>
              <div style={{...s.statCard, background:'linear-gradient(135deg,#667eea,#764ba2)'}}>
                <h2 style={s.statNum}>{tasks.length}</h2>
                <p style={s.statLabel}>Total Tasks</p>
              </div>
              <div style={{...s.statCard, background:'linear-gradient(135deg,#11998e,#38ef7d)'}}>
                <h2 style={s.statNum}>{doneTasks}</h2>
                <p style={s.statLabel}>Completed</p>
              </div>
              <div style={{...s.statCard, background:'linear-gradient(135deg,#f093fb,#f5576c)'}}>
                <h2 style={s.statNum}>{inProgress}</h2>
                <p style={s.statLabel}>In Progress</p>
              </div>
              <div style={{...s.statCard, background:'linear-gradient(135deg,#f7971e,#ffd200)'}}>
                <h2 style={s.statNum}>{overdue}</h2>
                <p style={s.statLabel}>Overdue</p>
              </div>
            </div>
            <h2 style={s.sectionTitle}>Recent Tasks</h2>
            {tasks.slice(0,5).map(t => (
              <div key={t.id} style={s.taskRow}>
                <span style={{...s.badge, background: t.status==='Done'?'#38ef7d':t.status==='In Progress'?'#f5576c':'#667eea'}}>{t.status}</span>
                <span style={s.taskTitle}>{t.title}</span>
                <span style={s.taskPriority}>{t.priority}</span>
              </div>
            ))}
            <h2 style={s.sectionTitle}>Projects</h2>
            {projects.map(p => (
              <div key={p.id} style={s.projectRow}>
                <div style={{...s.colorDot, background: p.color}}></div>
                <span style={s.taskTitle}>{p.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* PROJECTS */}
        {page === 'projects' && (
          <div>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Projects</h1>
              {user?.role === 'Admin' && <button style={s.btn} onClick={() => setShowProjectForm(!showProjectForm)}>+ New Project</button>}
            </div>
            {showProjectForm && (
              <div style={s.form}>
                <input style={s.input} placeholder="Project Name" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
                <input style={s.input} placeholder="Description" value={newProject.desc} onChange={e => setNewProject({...newProject, desc: e.target.value})} />
                <input style={s.input} type="color" value={newProject.color} onChange={e => setNewProject({...newProject, color: e.target.value})} />
                <button style={s.btn} onClick={createProject}>Create Project</button>
              </div>
            )}
            <div style={s.grid}>
              {projects.map(p => (
                <div key={p.id} style={{...s.card, borderTop: `4px solid ${p.color}`}}>
                  <h3 style={s.cardTitle}>{p.name}</h3>
                  <p style={s.cardDesc}>{p.description}</p>
                  <p style={s.cardMeta}>Tasks: {tasks.filter(t => t.project_id === p.id).length}</p>
                  {user?.role === 'Admin' && <button style={s.deleteBtn} onClick={() => deleteProject(p.id)}>Delete</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TASKS */}
        {page === 'tasks' && (
          <div>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Tasks</h1>
              <button style={s.btn} onClick={() => setShowTaskForm(!showTaskForm)}>+ New Task</button>
            </div>
            {showTaskForm && (
              <div style={s.form}>
                <input style={s.input} placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                <select style={s.input} value={newTask.project_id} onChange={e => setNewTask({...newTask, project_id: e.target.value})}>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {user?.role === 'Admin' && (
                  <select style={s.input} value={newTask.assignee_id} onChange={e => setNewTask({...newTask, assignee_id: e.target.value})}>
                    <option value="">Assign To</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                )}
                <select style={s.input} value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                  <option value="Low">Low</option>
                  <option value="Med">Medium</option>
                  <option value="High">High</option>
                </select>
                <input style={s.input} type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
                <button style={s.btn} onClick={createTask}>Create Task</button>
              </div>
            )}
            {tasks.map(t => (
              <div key={t.id} style={s.taskCard}>
                <div style={s.taskCardLeft}>
                  <span style={{...s.badge, background: t.priority==='High'?'#f5576c':t.priority==='Med'?'#f7971e':'#38ef7d'}}>{t.priority}</span>
                  <span style={s.taskTitle}>{t.title}</span>
                  {t.due_date && <span style={s.taskDate}>📅 {new Date(t.due_date).toLocaleDateString()}</span>}
                </div>
                <div style={s.taskCardRight}>
                  <select style={s.select} value={t.status} onChange={e => updateTaskStatus(t.id, e.target.value)}>
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                  {user?.role === 'Admin' && <button style={s.deleteBtn} onClick={() => deleteTask(t.id)}>🗑</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TEAM */}
        {page === 'team' && (
          <div>
            <h1 style={s.pageTitle}>Team</h1>
            <div style={s.grid}>
              {users.map(u => (
                <div key={u.id} style={s.card}>
                  <div style={s.avatar}>{u.name?.[0]}</div>
                  <h3 style={s.cardTitle}>{u.name}</h3>
                  <p style={s.cardDesc}>{u.email}</p>
                  <span style={{...s.badge, background: u.role==='Admin'?'#667eea':'#38ef7d'}}>{u.role}</span>
                  <p style={s.cardMeta}>Tasks: {tasks.filter(t => t.assignee_id === u.id).length}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  authBg: { minHeight:'100vh', background:'linear-gradient(135deg,#667eea,#764ba2)', display:'flex', alignItems:'center', justifyContent:'center' },
  authBox: { background:'white', padding:'40px', borderRadius:'16px', width:'360px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', display:'flex', flexDirection:'column', gap:'12px' },
  logo: { textAlign:'center', color:'#667eea', margin:0, fontSize:'28px' },
  logo2: { color:'white', margin:'0 0 20px 0', fontSize:'22px' },
  subtitle: { textAlign:'center', color:'#888', margin:0 },
  error: { color:'red', textAlign:'center', fontSize:'14px' },
  input: { padding:'12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', outline:'none', width:'100%', boxSizing:'border-box' },
  btn: { padding:'12px 20px', borderRadius:'8px', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', border:'none', fontSize:'14px', cursor:'pointer', fontWeight:'bold' },
  toggle: { textAlign:'center', color:'#667eea', cursor:'pointer', fontSize:'14px' },
  app: { display:'flex', minHeight:'100vh', background:'#f5f6fa' },
  sidebar: { width:'230px', background:'linear-gradient(180deg,#667eea,#764ba2)', padding:'25px 15px', display:'flex', flexDirection:'column', gap:'6px', minHeight:'100vh' },
  userCard: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', padding:'10px', background:'rgba(255,255,255,0.15)', borderRadius:'10px' },
  avatar: { width:'40px', height:'40px', borderRadius:'50%', background:'white', color:'#667eea', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'18px', flexShrink:0 },
  userName: { color:'white', margin:0, fontWeight:'bold', fontSize:'14px' },
  userRole: { color:'rgba(255,255,255,0.7)', margin:0, fontSize:'12px' },
  nav: { padding:'12px', borderRadius:'8px', background:'transparent', color:'white', border:'none', cursor:'pointer', textAlign:'left', fontSize:'14px' },
  navActive: { padding:'12px', borderRadius:'8px', background:'rgba(255,255,255,0.2)', color:'white', border:'none', cursor:'pointer', textAlign:'left', fontSize:'14px', fontWeight:'bold' },
  logoutBtn: { marginTop:'auto', padding:'12px', borderRadius:'8px', background:'rgba(255,0,0,0.3)', color:'white', border:'none', cursor:'pointer', textAlign:'left', fontSize:'14px' },
  main: { flex:1, padding:'30px', overflowY:'auto' },
  pageTitle: { color:'#333', marginBottom:'20px', fontSize:'28px' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  sectionTitle: { color:'#444', marginTop:'30px', marginBottom:'15px' },
  statsRow: { display:'flex', gap:'15px', marginBottom:'30px', flexWrap:'wrap' },
  statCard: { padding:'20px', borderRadius:'12px', color:'white', minWidth:'140px', flex:1 },
  statNum: { margin:0, fontSize:'32px', fontWeight:'bold' },
  statLabel: { margin:0, fontSize:'14px', opacity:0.9 },
  taskRow: { display:'flex', alignItems:'center', gap:'10px', padding:'12px', background:'white', borderRadius:'8px', marginBottom:'8px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  projectRow: { display:'flex', alignItems:'center', gap:'10px', padding:'12px', background:'white', borderRadius:'8px', marginBottom:'8px' },
  colorDot: { width:'14px', height:'14px', borderRadius:'50%' },
  badge: { padding:'4px 10px', borderRadius:'20px', color:'white', fontSize:'11px', fontWeight:'bold', whiteSpace:'nowrap' },
  taskTitle: { fontWeight:'500', color:'#333', flex:1 },
  taskPriority: { fontSize:'12px', color:'#888' },
  taskDate: { fontSize:'12px', color:'#888' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:'20px' },
  card: { background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  cardTitle: { margin:'0 0 8px 0', color:'#333' },
  cardDesc: { color:'#888', fontSize:'14px', margin:'0 0 10px 0' },
  cardMeta: { color:'#999', fontSize:'12px', margin:'8px 0 0 0' },
  form: { background:'white', padding:'20px', borderRadius:'12px', marginBottom:'20px', display:'flex', flexDirection:'column', gap:'10px', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  taskCard: { display:'flex', justifyContent:'space-between', alignItems:'center', background:'white', padding:'15px 20px', borderRadius:'10px', marginBottom:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  taskCardLeft: { display:'flex', alignItems:'center', gap:'10px', flex:1 },
  taskCardRight: { display:'flex', alignItems:'center', gap:'10px' },
  select: { padding:'8px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'13px' },
  deleteBtn: { padding:'6px 12px', borderRadius:'6px', background:'#ff4757', color:'white', border:'none', cursor:'pointer', fontSize:'13px' },
};

export default App;