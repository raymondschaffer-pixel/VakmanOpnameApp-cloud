import React, { useState, useMemo } from 'react';
import { AppState, PriceItem, DisciplineType } from '../types';
import { generateQuoteCoverLetter } from '../services/geminiService';
import { FileText, Wand2, Save, Send, FileCode, Image as ImageIcon, Users, List, Percent, Share2 } from 'lucide-react';

interface QuotePreviewProps {
  state: AppState;
  priceBook: PriceItem[];
}

const QuotePreview: React.FC<QuotePreviewProps> = ({ state, priceBook }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewTab, setViewTab] = useState<'quote' | 'disciplines'>('quote');
  const showFinances = state.projectInfo.showPricesAndQuantities;

  const totals = useMemo(() => {
    let laborTotal = 0;
    let materialTotal = 0;
    let vatHighBase = 0;
    let vatLowBase = 0;

    state.rooms.forEach(room => {
      room.tasks.forEach(task => {
        const item = priceBook.find(p => p.id === task.priceItemId);
        if (item) {
          const isRegie = item.id === 'ov-01';
          const itemLaborTotal = item.priceLabor * task.quantity;
          const actualMatPrice = task.customPriceMaterial !== undefined ? task.customPriceMaterial : item.priceMaterial;
          const itemMaterialTotal = isRegie ? actualMatPrice : (actualMatPrice * task.quantity);
          
          laborTotal += itemLaborTotal;
          materialTotal += itemMaterialTotal;
          
          const lineVat = task.customVat || item.vatLabor;
          const lineAmount = itemLaborTotal + itemMaterialTotal;

          if (lineVat === 'low') { 
            vatLowBase += lineAmount; 
          } else { 
            vatHighBase += lineAmount; 
          }
        }
      });
    });

    const vatHighAmount = vatHighBase * 0.21;
    const vatLowAmount = vatLowBase * 0.09;
    const subTotal = laborTotal + materialTotal;
    const grandTotal = subTotal + vatHighAmount + vatLowAmount;

    return { 
      laborTotal, 
      materialTotal, 
      subTotal, 
      vatHighBase, 
      vatLowBase, 
      vatHighAmount, 
      vatLowAmount, 
      grandTotal 
    };
  }, [state.rooms, priceBook]);

  const handleGenerateAI = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await generateQuoteCoverLetter(
        state.projectInfo,
        state.rooms,
        totals.grandTotal,
        priceBook
      );
      setCoverLetter(result);
    } catch (error) {
      console.error("AI Generation Error:", error);
      setCoverLetter("Fout bij het genereren van de begeleidende brief. Controleer uw verbinding of API-sleutel.");
    } finally {
      setIsGenerating(false);
    }
  };

  const disciplineTasks = useMemo(() => {
    const map = new Map<string, Array<{ roomName: string; taskName: string; quantity: number; unit: string; notes?: string; category: string; isRegie: boolean }>>();
    state.rooms.forEach(room => {
      room.tasks.forEach(task => {
        const item = priceBook.find(p => p.id === task.priceItemId);
        if (!item) return;
        
        let disciplineLabel = task.discipline || 'Niet toegewezen';
        if (disciplineLabel === 'Anders' && task.customDiscipline) {
            disciplineLabel = task.customDiscipline;
        }

        if (!map.has(disciplineLabel)) map.set(disciplineLabel, []);
        
        const isRegie = item.id === 'ov-01';
        const finalName = (isRegie && task.description) ? task.description : item.name;
        
        map.get(disciplineLabel)?.push({
          roomName: room.name,
          taskName: finalName,
          quantity: task.quantity,
          unit: item.unit,
          notes: task.description,
          category: item.category,
          isRegie
        });
      });
    });
    return map;
  }, [state.rooms, priceBook]);

  const generateFileName = (extension: string) => {
    const { projectInfo } = state;
    const part1 = projectInfo.workNumber || '';
    const part2 = projectInfo.address || '';
    const part3 = projectInfo.description || '';
    const part4 = projectInfo.surveyType || '';
    
    const combined = `${part4} ${part1} ${part2} ${part3}`.trim().replace(/[<>:"/\\|?*]/g, '');
    return (combined || 'Onbenoemde_Opname') + '.' + extension;
  };

  const getXmlString = () => {
    const { projectInfo, rooms } = state;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<VakmanProject>\n`;
    xml += `  <ProjectInfo>\n`;
    xml += `    <WorkNumber>${projectInfo.workNumber}</WorkNumber>\n`;
    xml += `    <SurveyType>${projectInfo.surveyType}</SurveyType>\n`;
    xml += `    <Description>${projectInfo.description}</Description>\n`;
    xml += `    <ClientName>${projectInfo.clientName}</ClientName>\n`;
    xml += `    <Address>${projectInfo.address}</Address>\n`;
    xml += `    <Date>${projectInfo.date}</Date>\n`;
    xml += `    <Email>${projectInfo.email}</Email>\n`;
    xml += `    <ShowFinances>${projectInfo.showPricesAndQuantities}</ShowFinances>\n`;
    xml += `  </ProjectInfo>\n`;
    xml += `  <Rooms>\n`;
    rooms.forEach(room => {
      xml += `    <Room name="${room.name}">\n`;
      room.tasks.forEach(task => {
        xml += `      <Task>\n`;
        xml += `        <PriceItemId>${task.priceItemId}</PriceItemId>\n`;
        xml += `        <Quantity>${task.quantity}</Quantity>\n`;
        xml += `        <Description>${task.description || ''}</Description>\n`;
        xml += `        <Discipline>${task.discipline || ''}</Discipline>\n`;
        xml += `        <CustomPriceMaterial>${task.customPriceMaterial || 0}</CustomPriceMaterial>\n`;
        xml += `      </Task>\n`;
      });
      xml += `    </Room>\n`;
    });
    xml += `  </Rooms>\n</VakmanProject>`;
    return xml;
  };

  const handleSendEmail = async () => {
    const { projectInfo } = state;
    const xmlContent = getXmlString();
    const fileName = generateFileName('xml');
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const file = new File([blob], fileName, { type: 'application/xml' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Opname: ${fileName}`,
          text: `Hierbij de opname gegevens voor ${projectInfo.address || 'project'}.\n\nMet vriendelijke groet,\nVan Wijnen Vastgoedbeheer`,
        });
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.error(err);
      }
    }

    const email = projectInfo.email;
    if (!email) { alert("Voer een emailadres in."); return; }
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(fileName)}&body=${encodeURIComponent("Zie bijlage in XML-formaat.")}`;
  };

  const handleExportXML = () => {
    const xml = getXmlString();
    const fileName = generateFileName('xml');
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const hasPhotos = state.rooms.some(r => r.photos && r.photos.length > 0);

  return (
    <div id="printable-quote" className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden font-sans">
      <div className="no-print bg-gray-100 p-2 flex gap-2 border-b">
        <button onClick={() => setViewTab('quote')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${viewTab === 'quote' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
          <List size={18} /> Offerte Detail
        </button>
        <button onClick={() => setViewTab('disciplines')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${viewTab === 'disciplines' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
          <Users size={18} /> Discipline Overzicht
        </button>
      </div>

      <div className="bg-white p-6 md:p-8 border-b-4 border-red-600">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex flex-col items-start w-full md:w-1/2">
             <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 uppercase tracking-tight">
               {viewTab === 'quote' ? 'OFFERTE' : 'DISCIPLINE OVERZICHT'}
             </h1>
             <div className="text-gray-600 w-full text-sm">
                <p className="font-medium">
                  {state.projectInfo.surveyType && <span className="text-red-600 font-black mr-2">[{state.projectInfo.surveyType}]</span>}
                  Referentie: <span className="text-gray-900">{state.projectInfo.workNumber || 'Nog niet toegewezen'}</span>
                </p>
                {state.projectInfo.description && <p className="mt-1 text-red-600 font-bold text-base leading-tight">{state.projectInfo.description}</p>}
             </div>
          </div>
          <div className="text-left md:text-right text-gray-600 text-[10px] md:text-xs leading-snug w-full md:w-1/2">
            <h2 className="text-xs md:text-sm font-bold text-gray-900 mb-0.5">Van Wijnen Vastgoedbeheer B.V.</h2>
            <p>Baarnsche dijk 14 | 3740 AB BAARN</p>
            <p>www.vanwijnen.nl</p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100">
        <div className="text-sm">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Opdrachtgever</h3>
          <p className="font-bold text-gray-900 text-base">{state.projectInfo.clientName || 'Onbekend'}</p>
          <p className="text-gray-600 whitespace-pre-line text-xs">{state.projectInfo.address || 'Geen adres'}</p>
          {state.projectInfo.email && <p className="text-blue-600 font-bold text-xs mt-0.5">{state.projectInfo.email}</p>}
        </div>
        <div className="text-left md:text-right text-sm">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Datum</h3>
           <p className="font-semibold text-gray-900">{state.projectInfo.date}</p>
        </div>
      </div>

      {viewTab === 'quote' ? (
        <>
          <div className="p-6 md:p-10 bg-gray-50 border-b print:bg-white">
            <div className="flex justify-between items-center mb-4 no-print">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><FileText size={18} className="text-red-600"/> Toelichting</h3>
              <button onClick={handleGenerateAI} disabled={isGenerating} className="text-sm bg-white border px-3 py-1.5 rounded-full hover:bg-gray-100 disabled:opacity-50">
                {isGenerating ? 'Genereren...' : <><Wand2 size={14} className="inline mr-1" /> AI Brief</>}
              </button>
            </div>
            {coverLetter ? <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg border text-sm">{coverLetter}</div> : <p className="text-sm italic text-gray-400 no-print">Geen brief gegenereerd.</p>}
          </div>

          <div className="p-6 md:p-10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className={`py-3 font-bold uppercase text-xs ${showFinances ? 'w-1/3' : 'w-full'}`}>Omschrijving</th>
                  {showFinances && <><th className="py-3 font-bold text-center uppercase text-xs">Aantal</th><th className="py-3 font-bold text-right uppercase text-xs">Totaal</th></>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {state.rooms.map(room => room.tasks.length > 0 && (
                  <React.Fragment key={room.id}>
                    <tr className="bg-gray-50/80"><td colSpan={showFinances ? 3 : 1} className="py-2 px-3 font-bold border-l-4 border-red-600 text-sm">{room.name}</td></tr>
                    {room.tasks.map(task => {
                      const item = priceBook.find(p => p.id === task.priceItemId);
                      if (!item) return null;
                      const isRegie = item.id === 'ov-01';
                      const currentMat = task.customPriceMaterial !== undefined ? task.customPriceMaterial : item.priceMaterial;
                      const lineTotal = isRegie ? (item.priceLabor * task.quantity) + currentMat : (item.priceLabor + currentMat) * task.quantity;
                      const displayName = (isRegie && task.description) ? task.description : item.name;
                      const subNote = (!isRegie && task.description) ? task.description : null;
                      const disciplineDisplay = task.discipline === 'Anders' ? task.customDiscipline : task.discipline;

                      return (
                        <tr key={task.id}>
                          <td className="py-2 pl-4">
                            <div className="font-medium text-gray-900 text-sm">{displayName}</div>
                            {subNote && <div className="text-[10px] text-gray-500 italic mt-0.5">{subNote}</div>}
                            <div className="flex gap-2 items-center mt-1">
                              {disciplineDisplay && <span className="text-[8px] text-blue-600 font-bold uppercase">{disciplineDisplay}</span>}
                              {(!isRegie || !task.description) && (
                                <span className="text-[8px] text-gray-400 uppercase">{item.category}</span>
                              )}
                            </div>
                          </td>
                          {showFinances && <><td className="py-2 text-center text-xs">{task.quantity} {item.unit}</td><td className="py-2 text-right font-bold text-gray-900 text-sm">€{lineTotal.toFixed(2)}</td></>}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="p-4 md:p-6 space-y-4">
          {Array.from(disciplineTasks.entries()).map(([discipline, tasks]) => (
            <div key={discipline} className="print:break-inside-avoid border rounded-lg overflow-hidden shadow-sm">
              <h3 className="text-sm font-bold bg-blue-600 text-white px-3 py-1.5 flex items-center justify-between">
                <span>Uitvoerder: {discipline}</span>
                <Users size={14} />
              </h3>
              <div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 font-bold border-b text-[10px] text-gray-500 uppercase">
                    <tr>
                      <th className="px-3 py-2 w-1/4">Ruimte</th>
                      <th className="px-3 py-2">Omschrijving</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tasks.map((t, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-1.5 font-medium text-gray-900">{t.roomName}</td>
                        <td className="px-3 py-1.5">
                          <div className="font-bold text-blue-700">{t.taskName}</div>
                          {t.notes && !t.isRegie && (
                            <div className="text-[10px] text-gray-500 italic mt-0.5">{t.notes}</div>
                          )}
                          <div className="text-[8px] text-gray-400 uppercase font-medium mt-0.5">{t.category}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {showFinances && viewTab === 'quote' && (
        <div className="p-6 md:p-10 bg-gray-50 border-t print:bg-white">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Percent size={12} /> BTW Specificatie</h4>
              <table className="w-full text-[10px]">
                <tbody className="divide-y">
                  {totals.vatLowBase > 0 && (
                    <tr><td className="py-1">BTW Laag (9%)</td><td className="text-right py-1">€{totals.vatLowBase.toFixed(2)}</td><td className="text-right py-1">€{totals.vatLowAmount.toFixed(2)}</td></tr>
                  )}
                  {totals.vatHighBase > 0 && (
                    <tr><td className="py-1">BTW Hoog (21%)</td><td className="text-right py-1">€{totals.vatHighBase.toFixed(2)}</td><td className="text-right py-1">€{totals.vatHighAmount.toFixed(2)}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="w-full md:w-64 space-y-1">
              <div className="flex justify-between text-xs text-gray-600"><span>Subtotaal (Excl. BTW)</span><span>€{totals.subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-xl font-bold text-red-600 border-t border-red-600 pt-2 mt-1"><span>Totaal incl. BTW</span><span>€{totals.grandTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Foto Appendix - Gecentreerd op een nieuwe pagina, per ruimte Voor/Na naast elkaar */}
      {hasPhotos && (
        <div className="print:break-before-page border-t-4 border-gray-200 p-6 md:p-8">
          <h2 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3 uppercase tracking-tighter border-b-2 pb-4">
            <ImageIcon className="text-red-600" size={24} /> BIJLAGE: FOTO-OVERZICHT SITUATIE VOOR & NA
          </h2>
          
          <div className="space-y-12">
            {state.rooms.map(room => {
              const beforePhotos = room.photos?.filter(p => p.category === 'before') || [];
              const afterPhotos = room.photos?.filter(p => p.category === 'after') || [];
              
              if (beforePhotos.length === 0 && afterPhotos.length === 0) return null;

              return (
                <div key={room.id} className="print:break-inside-avoid">
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 bg-gray-50 px-4 py-2 rounded-lg border-l-4 border-blue-600">
                    Locatie: {room.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-8">
                    {/* Kolom VOOR */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest text-center mb-2">Situatie Voor</h4>
                      {beforePhotos.length > 0 ? beforePhotos.map(p => (
                        <div key={p.id} className="border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm">
                           <img src={p.url} className="w-full aspect-[4/3] object-cover" />
                        </div>
                      )) : (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl aspect-[4/3] flex items-center justify-center text-[10px] text-gray-300 font-bold uppercase italic">Geen foto</div>
                      )}
                    </div>

                    {/* Kolom NA */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest text-center mb-2">Situatie Na</h4>
                      {afterPhotos.length > 0 ? afterPhotos.map(p => (
                        <div key={p.id} className="border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm">
                           <img src={p.url} className="w-full aspect-[4/3] object-cover" />
                        </div>
                      )) : (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl aspect-[4/3] flex items-center justify-center text-[10px] text-gray-300 font-bold uppercase italic">Geen foto</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="p-6 md:p-10 border-t flex flex-wrap gap-4 no-print justify-between bg-white">
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg font-medium shadow-md transition-all active:scale-95"><Save size={18} /> Printen / PDF</button>
            <button onClick={handleExportXML} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-md transition-all active:scale-95"><FileCode size={18} /> Export XML</button>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium shadow-md transition-all active:scale-95" onClick={handleSendEmail}><Share2 size={18} /> Verzenden / Deel</button>
      </div>
    </div>
  );
};

export default QuotePreview;