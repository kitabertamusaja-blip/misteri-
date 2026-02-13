
import React from 'react';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Brain, 
  TrendingUp, 
  Search, 
  Heart, 
  Share2, 
  ChevronRight,
  User,
  Star
} from 'lucide-react';
import { Dream, ZodiacInfo, PersonalityTest } from './types';

export const COLORS = {
  primary: '#7F5AF0',
  bg: '#0F0F1A',
  card: '#1A1A2E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA'
};

export const MOCK_DREAMS: Dream[] = [
  {
    id: 1,
    slug: 'mimpi-ular',
    judul: 'Mimpi Melihat Ular Besar',
    kategori: 'Hewan',
    ringkasan: 'Mimpi ini sering dikaitkan dengan godaan atau perubahan besar dalam hidup.',
    tafsir_positif: 'Menandakan penyembuhan, transformasi diri, dan kebijaksanaan yang akan datang.',
    tafsir_negatif: 'Bisa berarti adanya pengkhianatan dari orang terdekat atau rasa takut yang terpendam.',
    angka: '12, 45, 89',
    view_count: 1540
  },
  {
    id: 2,
    slug: 'mimpi-jatuh',
    judul: 'Mimpi Terjatuh dari Ketinggian',
    kategori: 'Kejadian',
    ringkasan: 'Simbol hilangnya kendali atau rasa cemas terhadap situasi tertentu.',
    tafsir_positif: 'Kesempatan untuk melepaskan beban lama dan memulai dari awal dengan kerendahan hati.',
    tafsir_negatif: 'Peringatan akan kegagalan rencana atau ketidakstabilan emosional.',
    angka: '08, 33, 72',
    view_count: 980
  },
  {
    id: 3,
    slug: 'mimpi-menikah',
    judul: 'Mimpi Menikah Lagi',
    kategori: 'Cinta',
    ringkasan: 'Mencerminkan komitmen baru atau keinginan untuk penyatuan dalam diri.',
    tafsir_positif: 'Harmoni dalam hubungan dan keselarasan batin yang baru ditemukan.',
    tafsir_negatif: 'Keresahan akan kebebasan yang hilang atau konflik dengan pasangan.',
    angka: '24, 61, 95',
    view_count: 1200
  }
];

export const ZODIAC_LIST: ZodiacInfo[] = [
  { id: 1, nama: 'Aries', tanggal: '21 Mar - 19 Apr', icon: '♈', deskripsi: 'Penuh energi and petualang.', cinta: 'Sangat bergairah hari ini.', karir: 'Fokus pada target jangka pendek.', keuangan: 'Waspada pengeluaran mendadak.' },
  { id: 2, nama: 'Taurus', tanggal: '20 Apr - 20 Mei', icon: '♉', deskripsi: 'Stabil dan dapat diandalkan.', cinta: 'Harmoni menyelimuti hubungan.', karir: 'Kerja kerasmu mulai dilirik.', keuangan: 'Stabil, bisa mulai menabung.' },
  { id: 3, nama: 'Gemini', tanggal: '21 Mei - 20 Jun', icon: '♊', deskripsi: 'Cerdas dan komunikatif.', cinta: 'Komunikasi adalah kunci.', karir: 'Ide baru akan muncul.', keuangan: 'Ada peluang investasi kecil.' },
  { id: 4, nama: 'Cancer', tanggal: '21 Jun - 22 Jul', icon: '♋', deskripsi: 'Intuitif dan emosional.', cinta: 'Luangkan waktu untuk keluarga.', karir: 'Jangan terlalu sensitif di kantor.', keuangan: 'Hemat untuk kebutuhan mendadak.' },
  { id: 5, nama: 'Leo', tanggal: '23 Jul - 22 Agu', icon: '♌', deskripsi: 'Kreatif dan percaya diri.', cinta: 'Pesonamu sedang memuncak.', karir: 'Waktunya memimpin proyek.', keuangan: 'Berani ambil resiko keuangan.' },
  { id: 6, nama: 'Virgo', tanggal: '23 Agu - 22 Sep', icon: '♍', deskripsi: 'Praktis dan setia.', cinta: 'Perhatikan hal-hal kecil.', karir: 'Ketelitian sangat dibutuhkan.', keuangan: 'Kelola anggaran dengan ketat.' },
  { id: 7, nama: 'Libra', tanggal: '23 Sep - 22 Okt', icon: '♎', deskripsi: 'Diplomatis dan artistik.', cinta: 'Keadilan dalam hubungan.', karir: 'Kerjasama tim sangat baik.', keuangan: 'Pengeluaran untuk seni/hobi.' },
  { id: 8, nama: 'Scorpio', tanggal: '23 Okt - 21 Nov', icon: '♏', deskripsi: 'Bersemangat dan gigih.', cinta: 'Keintiman yang mendalam.', karir: 'Strategi rahasiamu berhasil.', keuangan: 'Keuntungan dari sumber tak terduga.' },
  { id: 9, nama: 'Sagittarius', tanggal: '22 Nov - 21 Des', icon: '♐', deskripsi: 'Optimis dan bebas.', cinta: 'Petualangan asmara menanti.', karir: 'Wawasan luas membantumu.', keuangan: 'Keberuntungan di perjalanan.' },
  { id: 10, nama: 'Capricorn', tanggal: '22 Des - 19 Jan', icon: '♑', deskripsi: 'Disiplin dan bertanggung jawab.', cinta: 'Kesetiaan yang teruji.', karir: 'Kenaikan posisi mungkin terjadi.', keuangan: 'Perencanaan matang membuahkan hasil.' },
  { id: 11, nama: 'Aquarius', tanggal: '20 Jan - 18 Feb', icon: '♒', deskripsi: 'Asli dan mandiri.', cinta: 'Berikan ruang pada pasangan.', karir: 'Inovasi teknis sangat dihargai.', keuangan: 'Cari cara baru hasilkan uang.' },
  { id: 12, nama: 'Pisces', tanggal: '19 Feb - 20 Mar', icon: '♓', deskripsi: 'Empati dan artistik.', cinta: 'Mimpi romantis jadi nyata.', karir: 'Gunakan intuisimu.', keuangan: 'Hati-hati penipuan online.' }
];

export const TEST_LIST: PersonalityTest[] = [
  {
    id: 1,
    nama_tes: 'Aura Keberuntungan',
    deskripsi: 'Cari tahu warna auramu dan bagaimana itu mempengaruhi keberuntunganmu hari ini.',
    questions: [
      {
        id: 1,
        pertanyaan: 'Warna apa yang pertama kali kamu lihat saat menutup mata?',
        opsi: [
          { label: 'A', text: 'Biru Tenang', skor: 10 },
          { label: 'B', text: 'Merah Membara', skor: 5 },
          { label: 'C', text: 'Ungu Mistis', skor: 15 }
        ]
      },
      {
        id: 2,
        pertanyaan: 'Bagaimana perasaanmu saat mendengar suara hujan?',
        opsi: [
          { label: 'A', text: 'Mengantuk', skor: 5 },
          { label: 'B', text: 'Tenang', skor: 10 },
          { label: 'C', text: 'Terinspirasi', skor: 15 }
        ]
      }
    ]
  }
];

// Fix: Add Moon and Sun to ICONS to prevent property access errors in App.tsx
export const ICONS = {
  Dream: Moon,
  Zodiac: Sparkles,
  Test: Brain,
  Trending: TrendingUp,
  Search: Search,
  Heart: Heart,
  Share: Share2,
  Next: ChevronRight,
  User: User,
  Star: Star,
  Moon: Moon,
  Sun: Sun
};
