
import React, { useState, useMemo, useRef } from 'react';
import { PriceItem, UnitType, VatType } from '../types';
import { Search, Plus, Edit2, Trash2, X, Save, RotateCcw, Download, Upload, Filter, Hammer, Box, HardDriveDownload, HardDriveUpload, Sparkles, ImageIcon, Check, Loader2, RefreshCcw, Code, Lock, Activity, Database, Cloud, AlertCircle, ShieldCheck, Wifi, CloudOff, Zap, Server, Shield } from 'lucide-react';

interface PriceBookManagerProps {
  items: PriceItem[];
  onAdd: (item: PriceItem) => void;
  onUpdate: (item: PriceItem) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
  onImport: (items: PriceItem[]) => void;
  onBackupSystem: () => void;
  onRestoreSystem: () => void;
  onFactoryReset: () => void;
  readOnly?: boolean;
}

const PriceBookManager: React.FC<PriceBookManagerProps> = ({ items, onAdd, onUpdate, onDelete, onReset, onImport, onBackupSystem, onRestoreSystem, onFactoryReset, readOnly = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  
  const isFirebaseConfigured = !!process.env.FB_API_KEY && process.env.FB_API_KEY !== "ONTBREKEND" && process.env.FB_API_KEY !== "";
  const isStorageConfigured = !!process.env.FB_STORAGE_BUCKET && process.env.FB_STORAGE_BUCKET !== "";

  const [formData, setFormData] = useState<Partial<PriceItem>>({
    category: '', name: '', unit: UnitType.M2, priceLabor: 0, priceMaterial: 0, vatLabor: 'high', vatMaterial: 'high'
  });

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Alle' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  const handleExportCSV = async () => {
    const headers = ['ID', 'Categorie', 'Omschrijving', 'Eenheid', 'PrijsArbeid', 'PrijsMateriaal', 'BtwArbeid', 'BtwMateriaal'];
    const rows = items.map(item => [item.id, item.category, item.name, item.unit, item.priceLabor.toString().replace('.', ','), item.priceMaterial.toString().replace('.', ','), item.vatLabor, item.vatMaterial]);
    const csvContent = [headers.join(';'), ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))].join('\n');
    const fileName = `prijsboek_export_${new Date().toISOString().split('T')[0]}.csv`;
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    link.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !formData.name || !formData.category) return;
    const newItem: PriceItem = { id: editingItem ? editingItem.id : `custom-${Date.now()}`, name: formData.name, category: formData.category, unit: formData.unit as UnitType, priceLabor: Number(formData.priceLabor), priceMaterial: Number(formData.priceMaterial || 0), vatLabor: (formData.vatLabor as VatType) || 'high', vatMaterial: (formData.vatMaterial as VatType) || 'high' };
    if (editingItem) onUpdate(newItem); else onAdd(newItem);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-6 rounded-2xl border-2 shadow-sm transition-all ${isFirebaseConfigured ? 'bg-white border-blue-500' : 'bg-orange-50 border-orange-200'}`}>
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isFirebaseConfigured ? 'bg-blue-600 text-white' : 'bg-orange-100 text-orange-700'}`}>
                  {isFirebaseConfigured ? <Zap size={24} className="fill-white"/> : <AlertCircle size={24}/>}
                </div>
                <div>
                   <h3 className="font-black text-gray-800 uppercase text-[10px] tracking-widest leading-none">Cloud Status</h3>
                   <span className="text-xs font-black text-blue-700 uppercase tracking-tighter">Blaze Plan Enterprise</span>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${isFirebaseConfigured ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                 <Wifi size={10} /> {isFirebaseConfigured ? 'Live' : 'Config'}
              </div>
           </div>
           
           {!isFirebaseConfigured ? (
             <p className="text-[11px] text-orange-800 font-bold leading-tight">
               Configuratie niet gevonden. Voeg de variabelen toe in Netlify Site Settings.
             </p>
           ) : (
             <div className="space-y-3">
                <div className="flex items-center gap-2">
                   {isStorageConfigured ? (
                      <span className="text-[10px] font-black text-white bg-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md border-b-2 border-blue-900">
                        <ShieldCheck size={14}/> BLAZE STORAGE ACTIEF
                      </span>
                   ) : (
                      <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 flex items-center gap-1">
                        <CloudOff size={14}/> DATABASE FALLBACK ACTIEF
                      </span>
                   )}
                </div>
                <p className="text-[10px] text-gray-500 font-bold leading-tight italic">
                  {isStorageConfigured 
                    ? "Systeem geoptimaliseerd. Foto's worden opgeslagen in uw persoonlijke Google Cloud Bucket." 
                    : "Opslag-bucket nog niet gekoppeld. Gebruik FB_STORAGE_BUCKET variabele."}
                </p>
             </div>
           )}
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-gray-300 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 text-gray-700 rounded-lg"><Server size={20}/></div>
              <h3 className="font-black text-gray-800 uppercase text-[10px] tracking-widest leading-none">Netwerk Info</h3>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Sync Mode</div>
                 <div className="text-lg font-black text-blue-600">Enterprise</div>
              </div>
              <div>
                 <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Veiligheid</div>
                 <div className="text-lg font-black text-green-600 flex items-center gap-1">SSL/HTTPS <Shield size={16}/></div>
              </div>
           </div>
        </div>
      </div>

      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${readOnly ? 'opacity-95' : ''}`}>
        <div className="p-6 border-b bg-gray-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Prijsboek Beheer {readOnly && <Lock size={18} className="text-orange-500"/>}
              </h2>
              <p className="text-sm text-gray-500">Centrale prijslijst voor alle vakmannen.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {!readOnly && (
                  <button onClick={() => { setEditingItem(null); setFormData({ category: 'Algemeen', name: '', unit: UnitType.M2, priceLabor: 0, priceMaterial: 0, vatLabor: 'high', vatMaterial: 'high' }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-black text-xs flex items-center gap-2 uppercase shadow-md active:scale-95"><Plus size={16} /> Item Toevoegen</button>
                )}
                <button onClick={handleExportCSV} className="bg-white border-2 border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-black text-xs flex items-center gap-2 uppercase shadow-sm active:scale-95"><Download size={16} /> Export CSV</button>
            </div>
        </div>

        <div className="p-4 border-b bg-gray-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input type="text" placeholder="Zoek op omschrijving of categorie..." className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 font-bold transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b">
              <tr>
                <th className="py-3 px-4">Omschrijving</th>
                <th className="py-3 px-4 text-right">Arbeid</th>
                <th className="py-3 px-4 text-right">Materiaal</th>
                <th className="py-3 px-4 text-right">Totaal</th>
                {!readOnly && <th className="py-3 px-4 text-right">Acties</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 group">
                  <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{item.category} | per {item.unit}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-600">€{item.priceLabor.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-600">€{item.priceMaterial.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right"><span className="font-black text-gray-900">€{(item.priceLabor + item.priceMaterial).toFixed(2)}</span></td>
                  {!readOnly && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingItem(item); setFormData({...item}); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => confirm('Wissen?') && onDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && !readOnly && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-black uppercase tracking-tighter text-lg">{editingItem ? 'Item Aanpassen' : 'Nieuw Item Toevoegen'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Omschrijving</label>
                  <input type="text" placeholder="Bijv. Wandtegelwerk badkamer" required className="w-full p-4 border-2 border-gray-100 rounded-xl font-bold outline-none focus:border-blue-600 bg-gray-50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Categorie</label>
                  <input type="text" placeholder="Bijv. Badkamer Renovatie" required className="w-full p-4 border-2 border-gray-100 rounded-xl font-bold outline-none focus:border-blue-600 bg-gray-50" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Arbeid (€)</label>
                    <input type="number" step="0.01" required className="w-full p-4 border-2 border-gray-100 rounded-xl font-bold outline-none focus:border-blue-600 bg-gray-50" value={formData.priceLabor} onChange={e => setFormData({...formData, priceLabor: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Materiaal (€)</label>
                    <input type="number" step="0.01" className="w-full p-4 border-2 border-gray-100 rounded-xl font-bold outline-none focus:border-blue-600 bg-gray-50" value={formData.priceMaterial} onChange={e => setFormData({...formData, priceMaterial: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-700 text-white py-5 rounded-xl font-black uppercase shadow-xl hover:bg-blue-800 transition-all active:scale-95">Item Opslaan</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceBookManager;
