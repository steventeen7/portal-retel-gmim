import { supabase } from '../supabase/client';
import { User, SoalTes, NilaiUser, SoalWawancara, Materi } from './local';

export const supabaseDB = {
  users: {
    async findByEmail(email: string): Promise<User | undefined> {
      const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
      return data || undefined;
    },
    async findById(id: string): Promise<User | undefined> {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      return data || undefined;
    },
    async create(data: any): Promise<any> {
      const { data: newUser, error } = await supabase
        .from('profiles')
        .insert([{
          ...data,
          is_approved: false, // Default false sesuai permintaan
          permissions: [], // Default kosong
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return newUser;
    },
    async findAll(): Promise<any[]> {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    async updatePermissions(id: string, permissions: string[], is_approved: boolean): Promise<any> {
      const { data, error } = await supabase
        .from('profiles')
        .update({ permissions, is_approved })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  soalTes: {
    async findByTahun(tahun: number): Promise<SoalTes[]> {
      const { data } = await supabase.from('soal_tes').select('*').eq('tahun', tahun).order('nomor_soal');
      return data || [];
    },
    async findAll(): Promise<SoalTes[]> {
      const { data } = await supabase.from('soal_tes').select('*').order('tahun', { ascending: false }).order('nomor_soal');
      return data || [];
    },
    async getTahunList(): Promise<number[]> {
      const { data } = await supabase.from('soal_tes').select('tahun');
      const tahunSet = new Set(data?.map(d => d.tahun) || []);
      return Array.from(tahunSet).sort((a, b) => b - a);
    }
  },

  nilaiUser: {
    async create(data: any): Promise<NilaiUser> {
      const { data: result, error } = await supabase.from('nilai_user').insert([data]).select().single();
      if (error) throw error;
      return result;
    },
    async findByUser(userId: string): Promise<NilaiUser[]> {
      const { data } = await supabase.from('nilai_user').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      return data || [];
    },
    async findAll(): Promise<NilaiUser[]> {
      const { data } = await supabase.from('nilai_user').select('*').order('created_at', { ascending: false });
      return data || [];
    }
  },

  soalWawancara: {
    async findAll(): Promise<SoalWawancara[]> {
      const { data } = await supabase.from('soal_wawancara').select('*');
      return data || [];
    },
    async findByKategori(kategori: string): Promise<SoalWawancara[]> {
      const { data } = await supabase.from('soal_wawancara').select('*').eq('kategori', kategori);
      return data || [];
    }
  },

  materi: {
    async findAll(): Promise<Materi[]> {
      const { data } = await supabase.from('materi_belajar').select('*');
      return data || [];
    },
    async findByKategori(kategori: string): Promise<Materi[]> {
      const { data } = await supabase.from('materi_belajar').select('*').eq('kategori', kategori);
      return data || [];
    },
    async findById(id: number): Promise<Materi | undefined> {
      const { data } = await supabase.from('materi_belajar').select('*').eq('id', id).single();
      return data || undefined;
    }
  },

  keywords: {
    async findAll(): Promise<any[]> {
      const { data } = await supabase.from('kata_kunci').select('*');
      return data || [];
    }
  },

  tigaBesar: {
    async findAll(): Promise<any[]> {
      const { data } = await supabase.from('soal_tiga_besar').select('*');
      return data || [];
    }
  },

  logs: {
    async create(userId: string, activity: string): Promise<void> {
      await supabase.from('activity_logs').insert([{ user_id: userId, activity, timestamp: new Date().toISOString() }]);
    },
    async findAll(): Promise<any[]> {
      const { data } = await supabase.from('activity_logs').select('*, profiles(full_name)').order('timestamp', { ascending: false });
      return data || [];
    }
  }
};
