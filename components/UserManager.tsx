import React, { useState, useRef } from 'react';
import { UserAccount, UserRole } from '../types';
import { UserPlus, Trash2, Shield, User as UserIcon, X, Check, ShieldCheck, UserCircle2, CloudUpload, Download, Upload, AlertTriangle, Smartphone } from 'lucide-react';

interface UserManagerProps {
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onDeleteUser: (id: string) => void;
  onSyncUsers?: () => void;
  onImportUsers?: (users: UserAccount[]) => void;
  isSyncing?: boolean;
}

const UserManager: React.FC<UserManagerProps> = ({ users, onAddUser, onDeleteUser, onSyncUsers, onImportUsers, isSyncing }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      username,
      password,
      role,
      createdAt: new Date().toLocaleDateString(),
    };

    onAddUser(newUser);
    setIsModalOpen(false);
    setUsername('');
    setPassword('');
    setRole('user');
  };

  const handleExportUsers = () => {
    const data = JSON.stringify(users, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vakman_accounts_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported) && onImportUsers) {
          if (confirm(`Weet u zeker dat u ${imported.length} accounts wilt importeren? Dit overschrijft de huidige lijst.`)) {
            onImportUsers(imported);
          }
        }
      } catch (err) {
        alert("Ongeldig bestandsformaat.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <input type="file" ref={fileInputRef} onChange={handleImportUsers} accept=".json" className="hidden" />
      
      <div className="p-6 border-b-2 border-gray-100 bg-purple-50 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg"><ShieldCheck size={28} /></div>
          <div>
            <h2 className="text-xl font-black text-gray-800">Accountbeheer</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-widest">Administrator paneel</span>
              <span className="text-[8px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                <Smartphone size={8}/> LOKAAL OP DIT APPARAAT
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={handleExportUsers}
            className="bg-white border-2 border-gray-200 text-gray-600 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 font-black text-sm uppercase shadow-sm active:scale-95"
            title="Exporteer accounts naar bestand om op een ander apparaat te laden"
          >
            <Download size={18} />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border-2 border-gray-200 text-gray-600 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 font-black text-sm uppercase shadow-sm active:scale-95"
            title="Importeer accounts vanuit een bestand"
          >
            <Upload size={18} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2 font-black text-sm uppercase shadow-md active:scale-95"
          >
            <UserPlus size={18} /> Nieuw Account
          </button>
        </div>
      </div>

      <div className="p-4 bg-orange-50 border-b-2 border-orange-100">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-orange-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-orange-800 font-bold leading-tight">
            OPMERKING: Gebruikers worden opgeslagen in het geheugen van deze browser. Om accounts naar een andere iPad over te zetten, gebruikt u de export/import knoppen hierboven.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b">
            <tr>
              <th className="py-4 px-6">Gebruiker</th>
              <th className="py-4 px-6">Bevoegdheid</th>
              <th className="py-4 px-6">Geregistreerd</th>
              <th className="py-4 px-6 text-right">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-purple-50/30 transition-colors group">
                <td className="py-4 px-6 font-black text-gray-900">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      <UserCircle2 size={20} />
                    </div>
                    <span>{user.username}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role === 'admin' ? <Shield size={12} /> : null}
                    {user.role === 'admin' ? 'Administrator' : 'Vakman'}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-400 font-bold">{user.createdAt}</td>
                <td className="py-4 px-6 text-right">
                  {user.username !== 'Administrator' ? (
                    <button 
                      onClick={() => confirm(`Gebruiker ${user.username} verwijderen?`) && onDeleteUser(user.id)}
                      className="text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-gray-300 uppercase">Beveiligd</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-12 text-center">
             <UserCircle2 size={48} className="mx-auto mb-4 text-gray-200" />
             <p className="text-gray-400 font-bold">Nog geen extra accounts aangemaakt.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-black text-xl text-gray-800 uppercase tracking-tighter">Nieuw Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Gebruikersnaam</label>
                <input 
                  type="text" required placeholder="Bijv. j.de.vries"
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-purple-600 font-black transition-all bg-gray-50"
                  value={username} onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Wachtwoord</label>
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-purple-600 font-black transition-all bg-gray-50"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Gebruikersrol</label>
                <div className="grid grid-cols-2 gap-3">
                   <button type="button" onClick={() => setRole('user')} className={`p-4 rounded-2xl border-2 font-black uppercase text-xs transition-all ${role === 'user' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-100 text-gray-400'}`}>Vakman</button>
                   <button type="button" onClick={() => setRole('admin')} className={`p-4 rounded-2xl border-2 font-black uppercase text-xs transition-all ${role === 'admin' ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-md' : 'border-gray-100 text-gray-400'}`}>Admin</button>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-purple-700 transition-all mt-4 flex justify-center items-center gap-2 active:scale-95"
              >
                <Check size={20} /> Account aanmaken
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;