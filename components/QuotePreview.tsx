
import React, { useState, useMemo } from 'react';
import { AppState, PriceItem, DisciplineType } from '../types';
import { Save, Share2, ShieldAlert, CheckCircle, ShieldCheck as ShieldIcon, Copyright, Table as TableIcon } from 'lucide-react';

interface QuotePreviewProps {
  state: AppState;
  priceBook: PriceItem[];
}

const QuotePreview: React.FC<QuotePreviewProps> = ({ state, priceBook }) => {
  const [viewTab, setViewTab] = useState<'quote' | 'photos' | 'disciplines'>('quote');
  const showFinances = state.projectInfo.showPricesAndQuantities;

  const totals = useMemo(() => {
    let subTotal = 0;
    state.rooms.forEach(room => {
      room.tasks.forEach(task => {
        const item = priceBook.find(p => p.id === task.priceItemId);
        if (item) {
          const isRegie = item.id === 'ov-01';
          const labor = item.priceLabor * task.quantity;
          const material = isRegie ? (task.customPriceMaterial || 0) : (item.priceMaterial * task.quantity);
          subTotal += (labor + material);
        }
      });
    });
    return { subTotal, grandTotal: subTotal * 1.21 };
  }, [state.rooms, priceBook]);

  // Matrix data genereren voor het discipline overzicht
  const matrixData = useMemo(() => {
    const disciplinesSet = new Set<DisciplineType>();
    state.rooms.forEach(r => r.tasks.forEach(t => t.discipline && disciplinesSet.add(t.discipline)));
    const disciplines = Array.from(disciplinesSet).filter(d => d !== '').sort();
    
    return {
      disciplines,
      rows: state.rooms.filter(r => r.tasks.length > 0).map(room => ({
        roomName: room.name,
        checks: disciplines.map(d => room.tasks.some(t => t.discipline === d))
      }))
    };
  }, [state.rooms]);

  const hasPhotos = state.rooms.some(r => r.photos && r.photos.length > 0);

  return (
    <div id="printable-quote" className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden font-sans border border-gray-100 animate-in fade-in duration-700">
      {/* Tab Navigatie (alleen scherm) */}
      <div className="no-print bg-gray-100 p-2 flex gap-1 border-b overflow-x-auto scrollbar-hide">
        <button onClick={() => setViewTab('quote')} className={`flex-1 min-w-[120px] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${viewTab === 'quote' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:bg-white/50'}`}>Rapport Details</button>
        <button onClick={() => setViewTab('disciplines')} className={`flex-1 min-w-[120px] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${viewTab === 'disciplines' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:bg-white/50'}`}>Discipline Matrix</button>
        <button onClick={() => setViewTab('photos')} className={`flex-1 min-w-[120px] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${viewTab === 'photos' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:bg-white/50'}`}>Fotoverslag {hasPhotos && "•"}</button>
      </div>

      {/* Header (altijd zichtbaar) */}
      <div className="p-10 border-b-4 border-blue-600">
        <div className="flex justify-between items-start">
           <div>
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                {viewTab === 'quote' ? 'OPNAME RAPPORT' : viewTab === 'disciplines' ? 'DISCIPLINE OVERZICHT' : 'FOTO DOCUMENTATIE'}
              </h1>
              <p className="text-blue-600 font-black uppercase text-[10px] mt-2 tracking-widest">
                 Project: {state.projectInfo.workNumber || 'Concept'} | Status: {state.projectInfo.status || 'Concept'} | Type: {state.projectInfo.surveyType}
              </p>
           </div>
           <div className="text-right text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
              <p className="text-gray-900 font-black">Van Wijnen Vastgoedbeheer</p>
              <p>Baarnsche dijk 14</p>
              <p>3740 AB BAARN</p>
           </div>
        </div>
      </div>

      {/* Project Info Bar */}
      <div className="p-10 grid grid-cols-2 gap-10 border-b border-gray-50">
        <div>
           <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Locatie / Klant</h3>
           <p className="font-black text-gray-800 uppercase tracking-tight text-lg leading-tight">{state.projectInfo.clientName || 'Onbekend'}</p>
           <p className="text-gray-400 text-xs mt-1 italic font-medium whitespace-pre-line">{state.projectInfo.address}</p>
        </div>
        <div className="text-right">
           <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Datum van Opname</h3>
           <p className="font-black text-gray-800 uppercase tracking-tight text-lg">{state.projectInfo.date}</p>
        </div>
      </div>

      {/* Content: Rapport Details */}
      {viewTab === 'quote' && (
        <div className="p-10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="py-4 font-black uppercase text-[10px] tracking-widest text-gray-400">Locatie & Werkomschrijving</th>
                {showFinances && <th className="py-4 font-black text-right uppercase text-[10px] tracking-widest text-gray-400">Bedrag</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {state.rooms.map(room => room.tasks.length > 0 && (
                <React.Fragment key={room.id}>
                  <tr className="bg-gray-50/50"><td colSpan={showFinances ? 2 : 1} className="py-4 px-4 font-black border-l-4 border-blue-600 uppercase text-xs tracking-widest">{room.name}</td></tr>
                  {room.tasks.map(task => {
                    const item = priceBook.find(p => p.id === task.priceItemId);
                    if (!item) return null;
                    const total = (item.priceLabor + (task.customPriceMaterial || item.priceMaterial)) * task.quantity;
                    
                    /**
                     * WEERGAVE LOGICA (Volledig opgeschoond):
                     * We tonen nu alleen de Discipline. 
                     * Aantallen en eenheden zijn op verzoek overal in de rapportage verborgen.
                     */
                    const detailString = task.discipline || 'Van Wijnen';

                    return (
                      <tr key={task.id}>
                        <td className="py-4 px-6">
                           <div className="font-bold text-gray-800">{task.description || item.name}</div>
                           <div className="text-[9px] font-black uppercase text-blue-500 mt-0.5 tracking-tighter bg-blue-50 w-fit px-2 py-0.5 rounded">
                             {detailString}
                           </div>
                        </td>
                        {showFinances && <td className="py-3 text-right font-black text-gray-900">€{total.toFixed(2)}</td>}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {showFinances && (
            <div className="mt-12 flex justify-end">
               <div className="text-right border-t-2 border-gray-900 pt-4 min-w-[200px]">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Totaal indicatie excl. BTW</p>
                  <p className="text-3xl font-black text-blue-600 tracking-tighter mt-1">€{totals.subTotal.toFixed(2)}</p>
               </div>
            </div>
          )}
        </div>
      )}

      {/* Content: Discipline Matrix */}
      {viewTab === 'disciplines' && (
        <div className="p-10 animate-in fade-in duration-500">
           <div className="overflow-x-auto border-2 border-gray-100 rounded-2xl shadow-inner">
             <table className="w-full text-[10px] border-collapse">
                <thead>
                   <tr>
                      <th className="p-4 border bg-gray-900 text-white font-black uppercase tracking-widest text-left sticky left-0 z-10">Ruimte</th>
                      {matrixData.disciplines.map(d => (
                         <th key={d} className="p-4 border bg-gray-50 font-black uppercase tracking-widest text-center whitespace-nowrap min-w-[80px]">{d}</th>
                      ))}
                   </tr>
                </thead>
                <tbody>
                   {matrixData.rows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                         <td className="p-4 border font-black uppercase text-gray-800 sticky left-0 bg-inherit shadow-[2px_0_5px_rgba(0,0,0,0.05)]">{row.roomName}</td>
                         {row.checks.map((check, j) => (
                            <td key={j} className="p-4 border text-center">
                               {check && <div className="w-3 h-3 bg-blue-600 rounded-full mx-auto shadow-sm"></div>}
                            </td>
                         ))}
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
           <div className="mt-10 p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 flex items-center gap-4 no-print">
              <TableIcon size={24} className="text-blue-600" />
              <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">
                 Dit overzicht toont welke vakdisciplines per ruimte zijn ingepland voor de uitvoering.
              </p>
           </div>
        </div>
      )}

      {/* Content: Fotoverslag */}
      {viewTab === 'photos' && (
        <div className="p-10 space-y-20 animate-in fade-in duration-500">
          {state.rooms.map(room => {
            const before = room.photos?.filter(p => p.category === 'before') || [];
            const after = room.photos?.filter(p => p.category === 'after') || [];
            if (before.length === 0 && after.length === 0) return null;
            return (
              <div key={room.id} className="print:break-inside-avoid space-y-6">
                <div className="bg-gray-900 text-white px-8 py-3 rounded-2xl flex items-center gap-3 w-fit shadow-lg">
                   <span className="text-xs font-black uppercase tracking-[0.3em]">{room.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b-4 border-orange-500/20 pb-3">
                         <div className="bg-orange-500 text-white p-2 rounded-lg"><ShieldAlert size={14} /></div>
                         <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Situatie: VOOR</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                         {before.map(p => <div key={p.id} className="rounded-[2rem] overflow-hidden border-4 border-gray-100 shadow-md"><img src={p.url} className="w-full h-full object-cover" /></div>)}
                         {before.length === 0 && <div className="aspect-[4/3] border-4 border-dashed border-orange-100 rounded-[2rem] flex items-center justify-center text-[8px] text-gray-300 font-black italic p-6 text-center uppercase">Geen beeldmateriaal 'Voor'</div>}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b-4 border-green-500/20 pb-3">
                         <div className="bg-green-500 text-white p-2 rounded-lg"><CheckCircle size={14} /></div>
                         <h4 className="text-[11px] font-black text-green-600 uppercase tracking-widest">Situatie: NA</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                         {after.map(p => <div key={p.id} className="rounded-[2rem] overflow-hidden border-4 border-gray-100 shadow-md"><img src={p.url} className="w-full h-full object-cover" /></div>)}
                         {after.length === 0 && <div className="aspect-[4/3] border-4 border-dashed border-green-100 rounded-[2rem] flex items-center justify-center text-[8px] text-gray-300 font-black italic p-6 text-center uppercase">Geen beeldmateriaal 'Na'</div>}
                      </div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Intellectueel Eigendom */}
      <div className="p-10 border-t-2 border-gray-100 bg-gray-50/50 text-center flex flex-col items-center gap-3">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center justify-center gap-3">
            <Copyright size={14} /> Ontwikkeld door R.Schäffer
         </p>
         <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter flex items-center gap-2 italic">
            <ShieldIcon size={12} className="text-blue-500" /> Intellectueel eigendom is en blijft voorbehouden
         </p>
      </div>
      
      {/* Actie Knoppen (alleen scherm) */}
      <div className="p-8 border-t flex flex-wrap gap-4 no-print justify-center bg-white shadow-inner">
          <button onClick={() => window.print()} className="flex items-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase text-[11px] shadow-2xl hover:bg-black active:scale-95 transition-all tracking-widest"><Save size={20} /> PDF Opslaan</button>
          <button className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] shadow-2xl hover:bg-blue-700 active:scale-95 transition-all tracking-widest" onClick={() => window.location.href = `mailto:${state.projectInfo.email}?subject=Opname Rapport: ${state.projectInfo.address}`}><Share2 size={20} /> E-mail Rapport</button>
      </div>
    </div>
  );
};

export default QuotePreview;
