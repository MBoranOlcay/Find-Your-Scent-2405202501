// parfum-vitrini/app/perfumes/page.tsx

// "use client"; // Bu satır KALDIRILDI, artık bir Sunucu Bileşeni

import { supabase } from '@/lib/supabaseClient';
import type { Product as Perfume, FragranceNote, ProductDetails } from '@/types'; // Gerekli tipler
import PerfumeListClient from '@/components/PerfumeListClient'; // İstemci Bileşenimiz
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tüm Parfümler - Find Your Scent',
  description: 'Find Your Scent koleksiyonundaki tüm eşsiz parfümleri, markaları ve notaları keşfedin.',
};

// Marka adını URL dostu bir slug'a çevirmek için (eğer slug verisi yoksa kullanılabilir)
// İdealde bu fonksiyon bir utils dosyasında olmalı ve PerfumeCard gibi yerlerde de oradan import edilmeli.
const createPerfumeSlugForURL = (perfumeName: string): string => {
    if (!perfumeName) return "";
    return perfumeName.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

// Supabase'den tüm parfümleri çekmek için fonksiyon
async function getAllPerfumes(): Promise<Perfume[]> {
  console.log("[PerfumesPage - getAllPerfumes] Fetching all perfumes from Supabase...");
  
  // Supabase'den gelen veri için geçici bir tip (Supabase sorgusuna göre)
  interface SupabasePerfumeData {
    id: string | null;
    name: string | null;
    slug: string | null;
    description: string | null;
    images: string[] | null;
    brand: { name: string; } | null; // İlişkili brand tablosundan sadece name
    fragranceNotes: { // perfume_notes üzerinden notes tablosuna join
      note_type: string | null;
      note: { name: string; } | null; // notes tablosundan sadece name
    }[] | null;
    details_family: string | null;
    // PerfumeCard veya filtreleme için ihtiyaç duyabileceğin diğer alanlar buraya eklenebilir
  }
  
  const { data, error } = await supabase
    .from('perfumes')
    .select(`
      id, 
      name, 
      slug, 
      description, 
      images,
      details_family, 
      brand:brands ( name ), 
      fragranceNotes:perfume_notes (
        note_type,
        note:notes ( name ) 
      )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('[PerfumesPage - getAllPerfumes] Supabase error:', error.message);
    return [];
  }
  if (!data) {
    console.log('[PerfumesPage - getAllPerfumes] No perfumes found from Supabase.');
    return [];
  }
  console.log(`[PerfumesPage - getAllPerfumes] ${data.length} perfumes received from Supabase.`);

  // Gelen veriyi kendi Perfume tipimize map'leyelim
  return (data as SupabasePerfumeData[]).map(p => {
    const brandName = p.brand?.name ?? 'Bilinmeyen Marka';
    return {
      id: p.id?.toString() ?? `unknown-${Math.random().toString(36).substring(7)}`,
      name: p.name ?? 'İsimsiz Parfüm',
      slug: p.slug ?? createPerfumeSlugForURL(p.name ?? ''),
      brand: brandName,
      description: p.description ?? '',
      images: Array.isArray(p.images) ? p.images : [],
      fragranceNotes: Array.isArray(p.fragranceNotes) 
        ? p.fragranceNotes.map((pn) => ({
            name: pn.note?.name ?? 'Bilinmeyen Nota',
            type: (pn.note_type ?? 'base') as 'top' | 'heart' | 'base',
            description: '', // Listeleme için description'a şimdilik gerek yok
          })) 
        : [],
      details: { 
          family: p.details_family ?? undefined,
          // PerfumeCard veya filtreleme için gerekmeyen diğer details alanları undefined
          gender: undefined, concentration: undefined, releaseYear: undefined, longevity: undefined, sillage: undefined,
      } as ProductDetails,
      // PerfumeCard veya filtreleme için gerekmeyen diğer alanlar
      longDescription: undefined, 
      price: undefined, 
      discountPrice: undefined,
      ratings: undefined, 
      sizes: undefined, 
      reviews: undefined, 
      relatedProducts: undefined,
    };
  }) as Perfume[];
}

export default async function PerfumesPage() {
  const initialPerfumesData = await getAllPerfumes();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold font-serif text-gray-800 mb-8 text-center">
        Tüm Parfümler
      </h1>
      
      <PerfumeListClient initialPerfumes={initialPerfumesData} />
    </div>
  );
}