
import React, { useState, useEffect } from 'react';
import { ProjectInfo, Room, PriceItem, SavedProject, PhotoCategory, UserAccount } from './types';
import { INITIAL_PRICE_BOOK, ROOM_PRESETS } from './constants';
import PriceBookModal from './components/PriceBookModal';
import RoomDetail from './components/RoomDetail';
import QuotePreview from './components/QuotePreview';
import PriceBookManager from './components/PriceBookManager';
import UserManager from './components/UserManager';
import { fetchProjectsFromCloud, saveProjectToCloud, deleteProjectFromCloud, firebaseLogin, uploadPhotoToCloud, fetchUsersFromCloud, saveUserToCloud, deleteUserFromCloud } from './services/firebaseService';
import { Home, Lock, LogIn, PlusCircle, Database, ChevronRight, CloudUpload, Loader2, LogOut, LayoutDashboard, ClipboardList, Settings, Copyright, Eye, EyeOff, Trash2, RefreshCw, ShieldCheck as ShieldIcon } from 'lucide-react';

const DEFAULT_ADMIN: UserAccount = { 
  id: 'admin-1', 
  username: 'admin', 
  password: 'admin123', 
  role: 'admin', 
  createdAt: '01-01-2024' 
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudProjects, setCloudProjects] = useState<SavedProject[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'details' | 'rooms' | 'quote' | 'settings'>('projects');
  const [activeRoomIdForModal, setActiveRoomIdForModal] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('vakman_users');
    const parsed = saved ? JSON.parse(saved) : [];
    const hasAdmin = parsed.find((u: any) => u.username.toLowerCase() === 'admin');
    if (!hasAdmin) return [DEFAULT_ADMIN, ...parsed];
    return parsed;
  });

  const configStatus = {
    cloud: !!process.env.FB_API_KEY,
    ai: !!process.env.API_KEY
  };

  const [priceBook, setPriceBook] = useState<PriceItem[]>(() => {
    const saved = localStorage.getItem('vakman_price_book_v2');
    return saved ? JSON.parse(saved) : INITIAL_PRICE_BOOK;
  });

  useEffect(() => {
    localStorage.setItem('vakman_price_book_v2', JSON.stringify(priceBook));
  }, [priceBook]);

  useEffect(() => {
    localStorage.setItem('vakman_users', JSON.stringify(users));
  }, [users]);

  const handleRefreshCloud = async () => {
    if (!configStatus.cloud) return;
    setIsSyncing(true);
    try {
      const [projects, cloudUsers] = await Promise.all([
        fetchProjectsFromCloud(),
        fetchUsersFromCloud()
      ]);
      setCloudProjects(projects);
      if (cloudUsers.length > 0) {
        setUsers(prev => {
          const filteredCloud = cloudUsers.filter(u => u.username.toLowerCase() !== 'admin');
          const newList = [DEFAULT_ADMIN, ...filteredCloud];
          localStorage.setItem('vakman_users', JSON.stringify(newList));
          return newList;
        });
      }
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    handleRefreshCloud();
  }, []);

  const handleHardRefresh = () => {
    if (confirm("Dit zal de applicatie-cache volledig legen en de app opnieuw opstarten om de nieuwste functies te laden. Doorgaan?")) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const registration of registrations) {
            registration.unregister();
          }
          // window.location.reload takes no arguments in modern browsers
          window.location.reload();
        });
      } else {
        // window.location.reload takes no arguments in modern browsers
        window.location.reload();
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSyncing(true);

    const inputUser = loginUser.trim().toLowerCase();
    const inputPass = loginPass.trim();

    if (inputUser === 'admin' && inputPass === 'admin123') {
      setCurrentUser(DEFAULT_ADMIN);
      setIsAuthenticated(true);
      setIsSyncing(false);
      return;
    }

    const foundUser = users.find(u => u.username.toLowerCase() === inputUser && u.password === inputPass);
    if (foundUser) {
      setCurrentUser(foundUser);
      setIsAuthenticated(true);
      setIsSyncing(false);
      return;
    }

    if (configStatus.cloud) {
      try {
        await firebaseLogin(loginUser, inputPass);
        setCurrentUser({ id: 'cloud-master', username: loginUser, password: '', role: 'admin', createdAt: '' });
        setIsAuthenticated(true);
      } catch (err) {
        setLoginError("Accountgegevens onjuist.");
      }
    } else {
      setLoginError("Account niet gevonden.");
    }
    setIsSyncing(false);
  };

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    workNumber: '', description: '', clientName: '', address: '',
    date: new Date().toISOString().split('T')[0], email: '',
    maintenanceType: '', surveyType: 'VO', status: 'Concept', showPricesAndQuantities: true
  });

  const [rooms, setRooms] = useState<Room[]>([{ id: 'room-1', name: 'Algemeen', tasks: [], photos: [] }]);

  const handleSaveProject = async () => {
    if (!projectInfo.clientName) { alert("Vul klantnaam in."); return; }
    setIsSyncing(true);
    try {
      const id = activeProjectId || `P-${Date.now()}`;
      const project: SavedProject = {
        id: id,
        name: `${projectInfo.clientName} - ${projectInfo.address.substring(0, 15)}`,
        updatedAt: new Date().toLocaleString(),
        data: { projectInfo, rooms }
      };
      if (configStatus.cloud) await saveProjectToCloud(project);
      setActiveProjectId(id);
      alert("Project succesvol bijgewerkt in de cloud.");
      handleRefreshCloud();
    } catch (e) {
      alert("Fout bij opslaan.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Weet u zeker dat u het project "${name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
    setIsSyncing(true);
    try {
      if (configStatus.cloud) await deleteProjectFromCloud(id);
      if (activeProjectId === id) {
        setActiveProjectId(null);
        setRooms([{ id: 'room-1', name: 'Algemeen', tasks: [], photos: [] }]);
      }
      handleRefreshCloud();
    } catch (e) {
      alert("Fout bij verwijderen.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddPhoto = async (roomId: string, file: File, category: PhotoCategory) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      let url = base64;
      if (configStatus.cloud) {
        try {
          url = await uploadPhotoToCloud(roomId, base64);
        } catch (err) {
          console.warn("Lokaal opgeslagen");
        }
      }
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, photos: [...r.photos, { id: `img-${Date.now()}`, url, category, timestamp: Date.now() }] } : r));
    };
    reader.readAsDataURL(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md border-t-8 border-blue-600">
           <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl"><Lock size={40} /></div>
              <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter leading-none">Vakman Login</h1>
           </div>
           <form onSubmit={handleLogin} className="space-y-5">
              <input type="text" placeholder="Gebruikersnaam" className="w-full p-5 bg-gray-50 border-4 border-transparent rounded-2xl font-bold outline-none focus:border-blue-600" value={loginUser} onChange={e => setLoginUser(e.target.value)} />
              <input type="password" placeholder="Wachtwoord" className="w-full p-5 bg-gray-50 border-4 border-transparent rounded-2xl font-bold outline-none focus:border-blue-600" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
              {loginError && <p className="text-red-600 font-bold text-xs text-center bg-red-50 p-2 rounded-lg">{loginError}</p>}
              <button type="submit" className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black uppercase shadow-xl flex justify-center items-center gap-2 active:scale-95 transition-all">
                {isSyncing ? <Loader2 className="animate-spin" /> : <LogIn size={20} />} Aanmelden
              </button>
           </form>
           
           <div className="mt-12 pt-8 border-t-2 border-gray-50 flex flex-col gap-4">
              <button onClick={handleHardRefresh} className="w-full bg-orange-50 text-orange-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 border-orange-100 flex items-center justify-center gap-3 shadow-sm hover:bg-orange-600 hover:text-white transition-all">
                <RefreshCw size={14} className="animate-spin-slow"/> Systeem Update / Verversen
              </button>
              <p className="text-[9px] text-gray-400 text-center font-bold uppercase leading-relaxed">
                Heeft u nieuwe functies gekregen maar zijn deze niet zichtbaar?<br/>Gebruik bovenstaande knop om de cache te legen.
              </p>
           </div>
        </div>
        
        <div className="mt-12 text-center text-gray-400 flex flex-col items-center gap-2">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Copyright size={12}/> Ontwikkeld door R.Schäffer
           </p>
           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1.5 italic">
              <ShieldIcon size={10} className="text-blue-400" /> Intellectueel eigendom is en blijft voorbehouden
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-32">
      <header className="bg-white h-24 border-b-4 border-gray-100 sticky top-0 z-50 px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
           <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><Home size={28}/></div>
           <div>
              <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter leading-none">Vakman Tool</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Systeem: {currentUser?.username}</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={handleHardRefresh} className="bg-orange-50 text-orange-600 p-4 rounded-2xl hover:bg-orange-600 hover:text-white transition-colors no-print" title="Forceer Systeem Update"><RefreshCw size={20}/></button>
           <button onClick={() => { setIsAuthenticated(false); setCurrentUser(null); }} className="bg-red-50 text-red-600 p-4 rounded-2xl hover:bg-red-100 transition-colors"><LogOut size={20}/></button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-8 flex-grow">
        <nav className="flex gap-2 mb-12 overflow-x-auto pb-4 scrollbar-hide">
           {[
             { id: 'projects', label: 'Overzicht', icon: LayoutDashboard, role: 'all' },
             { id: 'details', label: 'Project Info', icon: ClipboardList, role: 'all' },
             { id: 'rooms', label: 'Opname', icon: PlusCircle, role: 'all' },
             { id: 'quote', label: 'Rapportage', icon: Database, role: 'all' },
             { id: 'settings', label: 'Beheer', icon: Settings, role: 'admin' }
           ].filter(tab => tab.role === 'all' || (tab.role === 'admin' && currentUser?.role === 'admin')).map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 min-w-[120px] py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all flex flex-col items-center gap-3 ${activeTab === tab.id ? 'bg-blue-700 text-white shadow-2xl scale-105' : 'bg-white text-gray-400 hover:bg-gray-100'}`}>
                <tab.icon size={24}/> {tab.label}
             </button>
           ))}
        </nav>

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <button onClick={() => { setActiveProjectId(null); setProjectInfo({ ...projectInfo, clientName: '', address: '', workNumber: '', surveyType: 'VO', status: 'Concept' }); setRooms([{ id: 'room-1', name: 'Algemeen', tasks: [], photos: [] }]); setActiveTab('details'); }} className="w-full bg-green-600 text-white p-12 rounded-[3rem] font-black text-2xl uppercase shadow-xl hover:bg-green-700 flex items-center justify-center gap-4 active:scale-95 transition-all">
               <PlusCircle size={32}/> Nieuwe Opname
            </button>
            <div className="grid gap-4">
               {cloudProjects.map(p => (
                 <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border-4 border-gray-100 shadow-md flex items-center justify-between group hover:border-blue-500 transition-all">
                    <div className="flex items-center gap-6 cursor-pointer flex-1" onClick={() => { setActiveProjectId(p.id); setProjectInfo(p.data.projectInfo); setRooms(p.data.rooms); setActiveTab('details'); }}>
                       <div className="bg-blue-50 text-blue-600 p-5 rounded-3xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Database size={32}/></div>
                       <div>
                          <h4 className="text-xl font-black text-gray-800">{p.name}</h4>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.updatedAt}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id, p.name); }}
                         className="p-4 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                       >
                         <Trash2 size={24} />
                       </button>
                       <ChevronRight size={24} className="text-gray-300 group-hover:text-blue-500 transition-all"/>
                    </div>
                 </div>
               ))}
               {cloudProjects.length === 0 && !isSyncing && (
                 <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-200">
                    <Database size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Geen cloud projecten gevonden</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
           <div className="bg-white p-12 rounded-[3rem] shadow-xl border-4 border-gray-50">
              <div className="flex justify-between items-center mb-12 border-b-4 border-gray-50 pb-8">
                 <h2 className="text-3xl font-black uppercase tracking-tighter">Project Informatie</h2>
                 <button onClick={handleSaveProject} className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm shadow-xl flex items-center gap-3 active:scale-95 transition-all">
                    <CloudUpload size={20}/> {activeProjectId ? 'Update in Cloud' : 'Opslaan Cloud'}
                 </button>
              </div>
              <div className="grid md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <label className="block space-y-2">
                       <span className="text-[10px] font-black uppercase text-gray-400 ml-4">Referentie / Werknummer</span>
                       <input type="text" className="w-full p-6 bg-gray-50 rounded-2xl font-bold outline-none border-4 border-transparent focus:border-blue-600 text-lg" value={projectInfo.workNumber} onChange={e => setProjectInfo({...projectInfo, workNumber: e.target.value})} />
                    </label>
                    <label className="block space-y-2">
                       <span className="text-[10px] font-black uppercase text-gray-400 ml-4">Klantnaam</span>
                       <input type="text" className="w-full p-6 bg-gray-50 rounded-2xl font-bold outline-none border-4 border-transparent focus:border-blue-600 text-lg" value={projectInfo.clientName} onChange={e => setProjectInfo({...projectInfo, clientName: e.target.value})} />
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block space-y-2">
                          <span className="text-[10px] font-black uppercase text-gray-400 ml-4">Soort Opname</span>
                          <div className="flex gap-2">
                              {['VO', 'BO', 'EO'].map(id => (
                                <button key={id} onClick={() => setProjectInfo({...projectInfo, surveyType: id as any})} className={`flex-1 p-4 rounded-xl font-black text-xs uppercase transition-all ${projectInfo.surveyType === id ? 'bg-blue-700 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>{id}</button>
                              ))}
                          </div>
                        </label>
                        <label className="block space-y-2">
                          <span className="text-[10px] font-black uppercase text-gray-400 ml-4">Status</span>
                          <div className="flex gap-2">
                              {['Concept', 'Definitief'].map(st => (
                                <button key={st} onClick={() => setProjectInfo({...projectInfo, status: st as any})} className={`flex-1 p-4 rounded-xl font-black text-[10px] uppercase transition-all ${projectInfo.status === st ? 'bg-blue-700 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>{st}</button>
                              ))}
                          </div>
                        </label>
                    </div>
                 </div>
                 <div className="space-y-8">
                    <label className="block space-y-2">
                       <span className="text-[10px] font-black uppercase text-gray-400 ml-4">Adresgegevens</span>
                       <textarea className="w-full p-6 bg-gray-50 rounded-2xl font-bold outline-none border-4 border-transparent focus:border-blue-600 text-lg min-h-[140px] resize-none" value={projectInfo.address} onChange={e => setProjectInfo({...projectInfo, address: e.target.value})} />
                    </label>
                    
                    <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 flex items-center justify-between">
                        <div>
                           <h4 className="font-black text-gray-800 uppercase text-xs tracking-widest leading-none">Financiële Details</h4>
                           <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 italic">Toon bedragen in rapportage</p>
                        </div>
                        <button 
                          onClick={() => setProjectInfo({...projectInfo, showPricesAndQuantities: !projectInfo.showPricesAndQuantities})}
                          className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-xs transition-all shadow-md ${projectInfo.showPricesAndQuantities ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}
                        >
                          {projectInfo.showPricesAndQuantities ? <Eye size={18} /> : <EyeOff size={18} />}
                          {projectInfo.showPricesAndQuantities ? 'AAN' : 'UIT'}
                        </button>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'rooms' && (
          <div className="space-y-8">
             <select className="w-full p-8 bg-white border-4 border-gray-800 rounded-[2.5rem] font-black text-xl uppercase outline-none shadow-2xl focus:border-blue-600 transition-all" onChange={e => { if(e.target.value) { setRooms([...rooms, { id: `R-${Date.now()}`, name: e.target.value, tasks: [], photos: [] }]); e.target.value = ''; }}}>
                <option value="">+ Ruimte toevoegen...</option>
                {ROOM_PRESETS.map(r => <option key={r} value={r}>{r}</option>)}
             </select>
             {rooms.map((room, idx) => (
               <RoomDetail 
                 key={room.id} room={room} priceBook={priceBook} projectInfo={projectInfo} index={idx} totalRooms={rooms.length}
                 onUpdateTask={(rid, tid, up) => setRooms(rooms.map(r => r.id === rid ? {...r, tasks: r.tasks.map(t => t.id === tid ? {...t, ...up} : t)} : r))}
                 onRemoveTask={(rid, tid) => setRooms(rooms.map(r => r.id === rid ? {...r, tasks: r.tasks.filter(t => t.id !== tid)} : r))}
                 onOpenPriceBook={rid => setActiveRoomIdForModal(rid)}
                 onDeleteRoom={rid => setRooms(rooms.filter(r => r.id !== rid))}
                 onAddPhoto={handleAddPhoto}
                 onRemovePhoto={(rid, pid) => setRooms(rooms.map(r => r.id === rid ? {...r, photos: r.photos.filter(p => p.id !== pid)} : r))}
                 onMoveRoom={(i, dir) => {
                    const newRooms = [...rooms];
                    const target = dir === 'up' ? i - 1 : i + 1;
                    if (target >= 0 && target < newRooms.length) {
                       [newRooms[i], newRooms[target]] = [newRooms[target], newRooms[i]];
                       setRooms(newRooms);
                    }
                 }}
               />
             ))}
          </div>
        )}

        {activeTab === 'quote' && <QuotePreview state={{ projectInfo, rooms }} priceBook={priceBook} />}

        {activeTab === 'settings' && currentUser?.role === 'admin' && (
          <div className="space-y-12">
             {/* Systeem Beheer Sectie */}
             <div className="bg-orange-50 p-8 rounded-[3rem] border-4 border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-orange-600 text-white rounded-2xl shadow-lg"><RefreshCw size={24}/></div>
                   <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-gray-800">Systeem Verversen</h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Forceer updates en wis iPad cache</p>
                   </div>
                </div>
                <button onClick={handleHardRefresh} className="bg-white border-4 border-orange-200 text-orange-600 px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-md hover:bg-orange-600 hover:text-white transition-all active:scale-95">
                   Wis Cache & Start Opnieuw
                </button>
             </div>

             <PriceBookManager 
                items={priceBook} 
                onAdd={it => setPriceBook([...priceBook, it])} 
                onUpdate={it => setPriceBook(priceBook.map(p => p.id === it.id ? it : p))} 
                onDelete={id => setPriceBook(priceBook.filter(p => p.id !== id))} 
                onReset={() => setPriceBook(INITIAL_PRICE_BOOK)} 
                onImport={setPriceBook} 
                onBackupSystem={() => {}} onRestoreSystem={() => {}} 
                onFactoryReset={() => setPriceBook(INITIAL_PRICE_BOOK)} 
             />
             <UserManager 
                users={users} 
                onAddUser={u => { setUsers([...users, u]); if(configStatus.cloud) saveUserToCloud(u); }} 
                onDeleteUser={id => { setUsers(users.filter(u => u.id !== id)); if(configStatus.cloud) deleteUserFromCloud(id); }} 
                isCloudEnabled={configStatus.cloud} 
             />
          </div>
        )}
      </main>

      <footer className="w-full py-16 px-8 text-center text-gray-300 no-print border-t border-gray-100 bg-white">
         <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
               <Copyright size={14}/> Ontwikkeld door R.Schäffer
            </p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1.5 italic">
               <ShieldIcon size={12} className="text-blue-400" /> Intellectueel eigendom is en blijft voorbehouden
            </p>
         </div>
      </footer>

      <PriceBookModal isOpen={!!activeRoomIdForModal} onClose={() => setActiveRoomIdForModal(null)} onSelect={item => {
          if (!activeRoomIdForModal) return;
          setRooms(rooms.map(r => r.id === activeRoomIdForModal ? {...r, tasks: [...r.tasks, { id: `T-${Date.now()}`, priceItemId: item.id, quantity: 1, discipline: 'Van Wijnen' }]} : r));
        }} priceBook={priceBook} />
    </div>
  );
};

export default App;
