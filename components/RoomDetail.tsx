import React, { useRef, useState, useMemo } from 'react';
import { Room, SelectedTask, PriceItem, PhotoCategory, ProjectInfo, DisciplineType, VatType } from '../types';
import { Trash2, PlusCircle, PenTool, Camera, X, ChevronUp, ChevronDown, MessageSquare, Box, Users, Loader2, Info, Hammer, Briefcase } from 'lucide-react';

interface RoomDetailProps {
  room: Room;
  priceBook: PriceItem[];
  projectInfo: ProjectInfo;
  index: number;
  totalRooms: number;
  onUpdateTask: (roomId: string, taskId: string, updates: any) => void;
  onRemoveTask: (roomId: string, taskId: string) => void;
  onOpenPriceBook: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onAddPhoto: (roomId: string, file: File, category: PhotoCategory) => void;
  onRemovePhoto: (roomId: string, photoId: string) => void;
  onMoveRoom: (index: number, direction: 'up' | 'down') => void;
}

const DISCIPLINES: DisciplineType[] = ['Van Wijnen', 'Loodgieter', 'Schilder', 'Installateur', 'Stucadoor', 'Sloper', 'Hovenier', 'Schoonmaker', 'Anders'];

const RoomDetail: React.FC<RoomDetailProps> = ({ 
  room, priceBook, projectInfo, index, totalRooms,
  onUpdateTask, onRemoveTask, onOpenPriceBook, onDeleteRoom, onAddPhoto, onRemovePhoto, onMoveRoom
}) => {
  const roomTotals = useMemo(() => {
    return room.tasks.reduce((acc, task) => {
      const item = priceBook.find(p => p.id === task.priceItemId);
      if (!item) return acc;
      const isRegie = item.id === 'ov-01';
      const actualMatPrice = task.customPriceMaterial !== undefined ? task.customPriceMaterial : item.priceMaterial;
      const total = isRegie ? (item.priceLabor * task.quantity) + actualMatPrice : (item.priceLabor + actualMatPrice) * task.quantity;
      return acc + total;
    }, 0);
  }, [room.tasks, priceBook]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-300 overflow-hidden mb-8 transition-all hover:border-blue-400 group">
      <div className="bg-gray-50 p-5 border-b-2 border-gray-200 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1 mr-2 no-print">
            <button onClick={() => onMoveRoom(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-20"><ChevronUp size={24} /></button>
            <button onClick={() => onMoveRoom(index, 'down')} disabled={index === totalRooms - 1} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-20"><ChevronDown size={24} /></button>
          </div>
          <div className="flex flex-col">
             <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                <span className="bg-blue-600 text-white p-2 rounded-xl shadow-lg"><PenTool size={24} /></span>
                {room.name}
             </h3>
             <div className="flex items-center gap-3 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${room.tasks.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                  {room.tasks.length} {room.tasks.length === 1 ? 'Taak' : 'Taken'}
                </span>
                {room.tasks.length > 0 && (
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                     <Info size={10} /> Est: €{roomTotals.toFixed(2)}
                   </span>
                )}
             </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => onDeleteRoom(room.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={24} /></button>
        </div>
      </div>

      <div className="p-6">
        {room.tasks.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 mb-8 group-hover:border-blue-200 transition-colors">
            <button onClick={() => onOpenPriceBook(room.id)} className="bg-blue-700 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-95 uppercase tracking-tight">+ Werkzaamheden Toevoegen</button>
            <p className="text-xs text-gray-400 font-bold uppercase mt-4 tracking-widest">Kies uit de centrale prijslijst</p>
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            {room.tasks.map(task => {
              const item = priceBook.find(p => p.id === task.priceItemId);
              if (!item) return null;
              const isRegie = item.id === 'ov-01';

              return (
                <div key={task.id} className="p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-500 transition-all shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] text-blue-700 font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{item.category}</span>
                           <span className="text-[10px] text-gray-400 font-bold uppercase">per {item.unit}</span>
                        </div>
                        
                        <div className="relative group/input">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest absolute -top-2 left-3 bg-white px-1 z-10">Omschrijving / Toelichting</label>
                           <textarea 
                              className="w-full p-3 border-2 border-gray-100 rounded-xl font-bold text-gray-800 outline-none focus:border-blue-400 bg-gray-50/30 min-h-[48px] resize-none"
                              value={task.description || ''}
                              placeholder={isRegie ? "Typ hier de specifieke werkzaamheden..." : item.name}
                              onChange={(e) => onUpdateTask(room.id, task.id, { description: e.target.value })}
                              rows={1}
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                           <div className="relative">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest absolute -top-2 left-3 bg-white px-1 z-10 flex items-center gap-1"><Briefcase size={8} /> Discipline</label>
                              <select 
                                className="w-full p-2 border-2 border-gray-100 rounded-xl font-bold text-xs bg-transparent outline-none focus:border-blue-400"
                                value={task.discipline || 'Van Wijnen'}
                                onChange={(e) => onUpdateTask(room.id, task.id, { discipline: e.target.value as DisciplineType })}
                              >
                                {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                           </div>
                           {isRegie && (
                              <div className="relative">
                                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest absolute -top-2 left-3 bg-white px-1 z-10 flex items-center gap-1"><Box size={8} /> Mat. Prijs</label>
                                 <input 
                                    type="number"
                                    className="w-full p-2 border-2 border-gray-100 rounded-xl font-bold text-xs bg-transparent outline-none focus:border-blue-400"
                                    value={task.customPriceMaterial ?? 0}
                                    onChange={(e) => onUpdateTask(room.id, task.id, { customPriceMaterial: parseFloat(e.target.value) || 0 })}
                                 />
                              </div>
                           )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto self-center md:self-start pt-2">
                       <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-xl border-2 border-blue-100 shadow-inner">
                          <input 
                             type="number" 
                             className="w-16 p-2 bg-transparent font-black text-center text-xl outline-none text-blue-800" 
                             value={task.quantity} 
                             onChange={(e) => onUpdateTask(room.id, task.id, { quantity: parseFloat(e.target.value) || 0 })} 
                          />
                          <span className="font-bold text-[10px] text-blue-400 uppercase mr-1">{item.unit}</span>
                       </div>
                       <button onClick={() => onRemoveTask(room.id, task.id)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={24} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
            <button onClick={() => onOpenPriceBook(room.id)} className="w-full py-5 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-black uppercase text-xs hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-2">
               <PlusCircle size={18} /> Extra Post toevoegen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetail;