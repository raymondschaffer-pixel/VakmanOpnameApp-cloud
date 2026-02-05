
import React, { useState, useMemo } from 'react';
import { PriceItem } from '../types';
import { Search, Plus, X, Hammer, Box, Star } from 'lucide-react';

interface PriceBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: PriceItem) => void;
  priceBook: PriceItem[];
}

const PriceBookModal: React.FC<PriceBookModalProps> = ({ isOpen, onClose, onSelect, priceBook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(priceBook.map(item => item.category)));
    return ['Alle', ...cats.sort()];
  }, [priceBook]);

  const filteredItems = useMemo(() => {
    // Splits de lijst in regiewerk en de rest
    const regieItem = priceBook.find(item => item.id === 'ov-01');
    const otherItems = priceBook.filter(item => {
      if (item.id === 'ov-01') return false;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Alle' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sorteer de overige items
    otherItems.sort((a, b) => a.name.localeCompare(b.name));

    // Voeg regiewerk bovenaan toe als het aan de filters voldoet (of toon het altijd bij 'Alle')
    if (regieItem) {
      const regieMatchesSearch = regieItem.name.toLowerCase().includes(searchTerm.toLowerCase());
      const regieMatchesCategory = selectedCategory === 'Alle' || regieItem.category === selectedCategory;
      if (regieMatchesSearch && regieMatchesCategory) {
        return [regieItem, ...otherItems];
      }
    }
    
    return otherItems;
  }, [searchTerm, selectedCategory, priceBook]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Selecteer Werkzaamheden</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 space-y-4 bg-white shadow-sm z-10">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Zoek werkzaamheden..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors border ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-3">
            {filteredItems.map(item => {
              const totalPrice = item.priceLabor + item.priceMaterial;
              const isFavorite = item.id === 'ov-01';
              return (
              <div 
                key={item.id} 
                onClick={() => { onSelect(item); onClose(); }}
                className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                  isFavorite 
                    ? 'bg-blue-50 border-blue-200 hover:border-blue-400' 
                    : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-md'
                }`}
              >
                <div className="flex-1">
                  <div className="font-bold text-gray-800 flex items-center gap-2">
                    {item.name}
                    {isFavorite && <Star size={14} className="text-blue-600 fill-blue-600" />}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{item.category}</div>
                  
                  <div className="flex gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                        <Hammer size={12} className="text-blue-500" /> 
                        <span>€{item.priceLabor.toFixed(2)}</span>
                    </div>
                    {item.priceMaterial > 0 && (
                        <div className="flex items-center gap-1">
                            <Box size={12} className="text-orange-500" /> 
                            <span>€{item.priceMaterial.toFixed(2)}</span>
                        </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4 pl-0 sm:pl-4 sm:border-l border-gray-100">
                   <div className="text-right">
                      <span className="block text-lg font-bold text-gray-900 leading-none">
                        €{totalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">per {item.unit}</span>
                   </div>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                    isFavorite ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                  }`}>
                    <Plus size={16} />
                  </div>
                </div>
              </div>
            )})}
            {filteredItems.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                Geen werkzaamheden gevonden.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceBookModal;
