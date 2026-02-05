
import React, { useState, useEffect } from 'react';
import { ProjectInfo, Room, PriceItem, SavedProject, PhotoCategory } from './types';
import { INITIAL_PRICE_BOOK, ROOM_PRESETS } from './constants';
import PriceBookModal from './components/PriceBookModal';
import RoomDetail from './components/RoomDetail';
import QuotePreview from './components/QuotePreview';
import PriceBookManager from './components/PriceBookManager';
import { fetchProjectsFromCloud, saveProjectToCloud, firebaseLogin, uploadPhotoToCloud } from './services/firebaseService';
import { Home, Lock, LogIn, Cloud, ShieldAlert, PlusCircle, Database, ChevronRight, CloudUpload, Loader2, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudProjects, setCloudProjects] = useState<SavedProject[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'details' | 'rooms' | 'quote' | 'settings'>('projects');
  const [activeRoomIdForModal, setActiveRoomIdForModal] = useState<string | null>(null);

  const configStatus = {
    cloud: !!process.env.FB_API_KEY,
    ai: !!process.env.API_KEY
  };

  const [priceBook, setPriceBook] = useState<PriceItem[]>(() => {
    const saved = localStorage.getItem('vakman_price_book_v2');
    return saved ? JSON.parse(saved) : INITIAL_PRICE_BOOK;
  });

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    workNumber: '', description: '', clientName: '', address: '',
    date: new Date().toISOString().split('T')[0], email: '',
    maintenanceType: '', surveyType: '', status: 'Concept', showPricesAndQuantities: true
  });

  const [rooms, setRooms] = useState<Room[]>([{ id: 'room-1', name: 'Algemeen', tasks: [], photos: [] }]);

  const handleRefreshCloud = async () => {
    if (!isAuthenticated || !configStatus.cloud) return;
    setIsSyncing(true);
    try {
      const projects = await fetchProjectsFromCloud();
      setCloudProjects(projects);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => { if (isAuthenticated) handleRefreshCloud(); }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSyncing(true);
    try {
      if (configStatus.cloud) {
        await firebaseLogin(loginUser, loginPass);
        setIsAuthenticated(true);
      } else if (loginUser === 'admin' && loginPass === 'admin123') {
        setIsAuthenticated(true);
      } else {
        setLoginError("Gebruik admin / admin123 voor lokale test.");
      }
    } catch (err) {
      setLoginError("Login mislukt. Check je gegevens.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectInfo.clientName) { alert("Vul klantnaam in"); return; }
    setIsSyncing(true);
    try {
      const project: SavedProject = {
        id: `P-${Date.now()}`,
        name: `${projectInfo.clientName} - ${projectInfo.address.substring(0, 15)}`,
        updatedAt: new Date().toLocaleString(),
        data: { projectInfo, rooms }
      };
      await saveProjectToCloud(project);
      alert("Succesvol opgeslagen in de Cloud!");
      handleRefreshCloud();
    } catch (e) {
      alert("Fout bij opslaan. Cloud niet verbonden?");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddPhoto = async (roomId: string, file: File, category: PhotoCategory) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const url = await uploadPhotoToCloud(roomId, base64);
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, photos: [...r.photos, { id: `img-${Date.now()}`, url, category, timestamp: Date.now() }] } : r));
      } catch (err) {
        alert("Foto upload mislukt.");
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md border-t-8 border-blue-600">
           <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl"><Lock size={40} /></div>
              <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Vakman Login</h1>
              {!configStatus.cloud && <p className="mt-4 bg-orange-100 text-orange-700 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={14}/> Geen Cloud-configuratie</p>}
           </div>
           <form onSubmit={handleLogin} className="space-y-6">
              <input type="text" placeholder="E-mail of 'admin'" className="w-full p-5 bg-gray-50 border-4 border-transparent rounded-2xl font-bold outline-none focus:border-blue-600" value={loginUser} onChange={e => setLoginUser(e.target.value)} />
              <input type="password" placeholder="Wachtwoord" className="w-full p-5 bg-gray-50 border-4 border-transparent rounded-2xl font-bold outline-none focus:border-blue-600" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
              {loginError && <p className="text-red-600 font-bold text-sm text-center">{loginError}</p>}
              <button type="submit" className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black uppercase shadow-xl flex justify-center items-center gap-2 transition-all active:scale-95">
                {isSyncing ? <Loader2 className="animate-spin" /> : <LogIn size={20} />} Aanmelden
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white h-24 border-b-4 border-gray-100 sticky top-0 z-50 px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
           <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><Home size={28}/></div>
           <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Vakman Cloud</h1>
        </div>
        <div className="flex items-center gap-4">
           <div className={`px-4 py-2 rounded-full font-black text-[10px] uppercase flex items-center gap-2 ${configStatus.cloud ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              <Cloud size={12}/> {configStatus.cloud ? 'Verbonden' : 'Lokaal'}
           </div>
           <button onClick={() => setIsAuthenticated(false)} className="bg-red-50 text-red-600 p-4 rounded-2xl hover:bg-red-100"><LogOut size={20}/></button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-8">
        <nav className="flex gap-2 mb-12 overflow-x-auto pb-4">
           {[
             { id: 'projects', label: 'Dashboard', icon: LayoutDashboard },
             { id: 'details', label: 'Adres', icon: ClipboardList },
             { id: 'rooms', label: 'Opname', icon: PlusCircle },
             { id: 'quote', label: 'Rapport', icon: Database }
           ].map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 min-w-[140px] py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all flex flex-col items-center gap-3 ${activeTab === tab.id ? 'bg-blue-700 text-white shadow-2xl scale-105' : 'bg-white text-gray-400'}`}>
                <tab.icon size={24}/> {tab.label}
             </button>
           ))}
        </nav>

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <button onClick={() => { setProjectInfo({...projectInfo, clientName: '', address: ''}); setRooms([{ id: 'room-1', name: 'Algemeen', tasks: [], photos: [] }]); setActiveTab('details'); }} className="w-full bg-green-600 text-white p-12 rounded-[3rem] font-black text-2xl uppercase shadow-xl hover:bg-green-700 flex items-center justify-center gap-4 active:scale-95 transition-all">
               <PlusCircle size={32}/> Start Nieuwe Opname
            </button>
            <div className="grid gap-4">
               {cloudProjects.map(p => (
                 <div key={p.id} onClick={() => { setProjectInfo(p.data.projectInfo); setRooms(p.data.rooms); setActiveTab('details'); }} className="bg-white p-8 rounded-[2.5rem] border-4 border-gray-100 shadow-md flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all">
                    <div className="flex items-center gap-6">
                       <div className="bg-blue-50 text-blue-600 p-5 rounded-3xl"><Database size={32}/></div>
                       <div>
                          <h4 className="text-xl font-black text-gray-800">{p.name}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.updatedAt}</p>
                       </div>
                    </div>
                    <ChevronRight size={24} className="text-gray-300"/>
                 </div>
               ))}
               {cloudProjects.length === 0 && !isSyncing && <p className="text-center text-gray-400 font-bold py-10 uppercase text-xs">Geen opnames gevonden in de cloud.</p>}
               {isSyncing && <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" size={40}/></div>}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
           <div className="bg-white p-12 rounded-[3rem] shadow-xl border-4 border-gray-50">
              <div className="flex justify-between items-center mb-12 border-b-4 border-gray-50 pb-8">
                 <h2 className="text-3xl font-black uppercase">Project Informatie</h2>
                 <button onClick={handleSaveProject} className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm shadow-xl flex items-center gap-3 active:scale-95">
                    <CloudUpload size={20}/> Opslaan Cloud
                 </button>
              </div>
              <div className="grid md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <label className="block space-y-2">
                       <span className="text-[10px] font-black uppercase text-gray-400 ml-4">Referentie / Dossier</span>
                       <input type="text" className="w-full p-6 bg-gray-50 rounded-2xl font-bold outline-none border-4 border-transparent focus:border-blue-600 text-lg" value={projectInfo.workNumber} onChange={e => setProjectInfo({...projectInfo, workNumber: e.target.value})} />
                    </label>
                    <label className="block space-y-2">
                       <span className="text-[10px] font-black uppercase text-gray-400 ml-4">Naam Klant</span>
                       <input type="text" className="w-full p-6 bg-gray-50 rounded-2xl font-bold outline-none border-4 border-transparent focus:border-blue-600 text-lg" value={projectInfo.clientName} onChange={e => setProjectInfo({...projectInfo, clientName: e.target.value})} />
                    </label>
                 </div>
                 <label className="block space-y-2">
                    <span className="text-[10px] font-black uppercase text-gray-400 ml-4">Adres & Plaats</span>
                    <textarea className="w-full p-6 bg-gray-50 rounded-2xl font-bold outline-none border-4 border-transparent focus:border-blue-600 text-lg min-h-[220px] resize-none" value={projectInfo.address} onChange={e => setProjectInfo({...projectInfo, address: e.target.value})} />
                 </label>
              </div>
           </div>
        )}

        {activeTab === 'rooms' && (
          <div className="space-y-8">
             <select className="w-full p-8 bg-white border-4 border-gray-800 rounded-[2.5rem] font-black text-xl uppercase outline-none shadow-2xl" onChange={e => { if(e.target.value) { setRooms([...rooms, { id: `R-${Date.now()}`, name: e.target.value, tasks: [], photos: [] }]); e.target.value = ''; }}}>
                <option value="">+ Voeg een ruimte toe...</option>
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
      </main>

      <PriceBookModal 
        isOpen={!!activeRoomIdForModal} 
        onClose={() => setActiveRoomIdForModal(null)} 
        onSelect={item => {
          if (!activeRoomIdForModal) return;
          setRooms(rooms.map(r => r.id === activeRoomIdForModal ? {...r, tasks: [...r.tasks, { id: `T-${Date.now()}`, priceItemId: item.id, quantity: 1, discipline: 'Van Wijnen' }]} : r));
        }} 
        priceBook={priceBook} 
      />
    </div>
  );
};

export default App;
