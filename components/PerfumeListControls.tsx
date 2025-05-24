// components/PerfumeListControls.tsx
"use client";

import React, { useState, useMemo } from 'react';
import type { Product as Perfume } from '@/types';
import PerfumeCard from './PerfumeCard';
import SearchBar from './SearchBar';
import FilterModal from './FilterModal';
import { Filter as FilterIcon } from 'lucide-react';

interface PerfumeListControlsProps {
  initialPerfumes: Perfume[];
}

export default function PerfumeListControls({ initialPerfumes }: PerfumeListControlsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // initialPerfumes'dan tüm markaları, notaları, aileleri çek (Supabase'den gelenler)
  const allAvailableBrands = useMemo(() => {
    const brands = new Set(initialPerfumes.map(p => p.brand).filter(Boolean as (b?:string) => b is string));
    return Array.from(brands).sort();
  }, [initialPerfumes]);

  const allAvailableNotes = useMemo(() => {
    const notesSet = new Set<string>();
    initialPerfumes.forEach(perfume => {
      if (perfume.fragranceNotes && Array.isArray(perfume.fragranceNotes)) {
        perfume.fragranceNotes.forEach(note => notesSet.add(note.name));
      }
    });
    return Array.from(notesSet).sort();
  }, [initialPerfumes]);

  const allAvailableFamilies = useMemo(() => {
    const familiesSet = new Set<string>();
    initialPerfumes.forEach(perfume => {
      if (perfume.details?.family) {
        familiesSet.add(perfume.details.family);
      }
    });
    return Array.from(familiesSet).sort();
  }, [initialPerfumes]);

  const filteredPerfumes = useMemo(() => {
    let perfumesToFilter = initialPerfumes;
    if (selectedBrands.length > 0) {
      perfumesToFilter = perfumesToFilter.filter(p => p.brand && selectedBrands.includes(p.brand));
    }
    if (selectedNotes.length > 0) {
      perfumesToFilter = perfumesToFilter.filter(p =>
        p.fragranceNotes && Array.isArray(p.fragranceNotes) &&
        p.fragranceNotes.some(note => note && note.name && selectedNotes.includes(note.name))
      );
    }
    if (selectedFamilies.length > 0) {
      perfumesToFilter = perfumesToFilter.filter(p =>
        p.details?.family && selectedFamilies.includes(p.details.family)
      );
    }
    if (searchTerm.trim()) {
      perfumesToFilter = perfumesToFilter.filter(
        p =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.fragranceNotes && p.fragranceNotes.some(note => note.name?.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    return perfumesToFilter;
  }, [searchTerm, selectedBrands, selectedNotes, selectedFamilies, initialPerfumes]);

  const handleSearchChange = (newSearchTerm: string) => setSearchTerm(newSearchTerm);
  const applyFiltersFromModal = (brands: string[], notes: string[], families: string[]) => {
    setSelectedBrands(brands);
    setSelectedNotes(notes);
    setSelectedFamilies(families);
    setIsFilterModalOpen(false);
  };
  const removeBrandFilter = (brandToRemove: string) => setSelectedBrands(prev => prev.filter(b => b !== brandToRemove));
  const removeNoteFilter = (noteToRemove: string) => setSelectedNotes(prev => prev.filter(n => n !== noteToRemove));
  const removeFamilyFilter = (familyToRemove: string) => setSelectedFamilies(prev => prev.filter(f => f !== familyToRemove));
  const clearAllFilters = () => { setSearchTerm(""); setSelectedBrands([]); setSelectedNotes([]); setSelectedFamilies([]); };

  const headerHeight = "5rem";
  const activeFilterCount = selectedBrands.length + selectedNotes.length + selectedFamilies.length + (searchTerm.trim() ? 1 : 0);

  return (
    <>
      {/* Arama ve Filtre Kontrolleri */}
      <div 
        className="sticky bg-white/90 backdrop-blur-md py-4 z-30 mb-6 shadow-sm rounded-lg"
        style={{ top: `calc(${headerHeight} + 0.5rem)` }}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center max-w-3xl mx-auto px-2">
          <div className="w-full sm:flex-grow">
            <SearchBar onSearchChange={handleSearchChange} initialValue={searchTerm} />
          </div>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-sans font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <FilterIcon size={18} />
            Filtrele 
            {activeFilterCount > 0 && (
              <span className="ml-1.5 bg-white text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Aktif Filtreleri Gösterme Alanı */}
      {(activeFilterCount > 0) && (
        <div className="mb-6 p-4 bg-amber-50 rounded-lg flex flex-wrap items-center gap-2">
          <span className="font-sans text-sm font-medium text-amber-800 mr-2">Aktif Filtreler:</span>
          {searchTerm.trim() && (
            <span className="inline-flex items-center gap-1.5 bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
              Ara: &quot;{searchTerm}&quot;
              <button onClick={() => setSearchTerm("")} className="ml-1 text-gray-500 hover:text-gray-700"><FilterIcon size={12} /></button>
            </span>
          )}
          {selectedBrands.map(brand => (
            <span key={brand} className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {brand}
              <button onClick={() => removeBrandFilter(brand)} className="ml-1 text-purple-500 hover:text-purple-700"><FilterIcon size={12} /></button>
            </span>
          ))}
          {selectedNotes.map(note => (
            <span key={note} className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {note}
              <button onClick={() => removeNoteFilter(note)} className="ml-1 text-teal-500 hover:text-teal-700"><FilterIcon size={12} /></button>
            </span>
          ))}
          {selectedFamilies.map(family => (
            <span key={family} className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {family}
              <button onClick={() => removeFamilyFilter(family)} className="ml-1 text-pink-500 hover:text-pink-700"><FilterIcon size={12} /></button>
            </span>
          ))}
          {(activeFilterCount > 0) && (
            <button onClick={clearAllFilters} className="ml-auto flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:underline pr-2">
              <FilterIcon size={12} /> Tümünü Temizle
            </button>
          )}
        </div>
      )}

      {/* Parfüm Listesi */}
      <div>
        {filteredPerfumes.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            {filteredPerfumes.map((perfume) => (
              <PerfumeCard key={perfume.id} perfume={perfume} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FilterIcon size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 font-sans mb-2">Sonuç Bulunamadı</p>
            <p className="text-gray-400 font-sans">Filtrelerinizi değiştirmeyi veya arama teriminizi kontrol etmeyi deneyin.</p>
          </div>
        )}
      </div>

      {isFilterModalOpen && (
        <FilterModal
          allBrands={allAvailableBrands}
          allNotes={allAvailableNotes}
          allFamilies={allAvailableFamilies}
          initialSelectedBrands={selectedBrands}
          initialSelectedNotes={selectedNotes}
          initialSelectedFamilies={selectedFamilies}
          onApplyFilters={applyFiltersFromModal}
          onClose={() => setIsFilterModalOpen(false)}
        />
      )}
    </>
  );
}