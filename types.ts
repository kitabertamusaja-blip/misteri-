
export interface Dream {
  id: number;
  slug: string;
  judul: string;
  kategori: string;
  ringkasan: string;
  tafsir_positif: string;
  tafsir_negatif: string;
  angka: string;
  view_count: number;
  created_at?: string;
}

export interface ZodiacInfo {
  id: number;
  nama: string;
  tanggal: string;
  icon: string;
  deskripsi: string;
  cinta: string;
  karir: string;
  keuangan: string;
}

export interface Question {
  id: number;
  pertanyaan: string;
  opsi: {
    label: string;
    text: string;
    skor: number;
  }[];
}

export interface PersonalityTest {
  id: number;
  nama_tes: string;
  deskripsi: string;
  questions: Question[];
}

export enum Page {
  HOME = 'home',
  SEARCH = 'search',
  DETAIL = 'detail',
  ZODIAC = 'zodiac',
  TEST = 'test',
  TRENDING = 'trending',
  FAVORITE = 'favorite'
}
