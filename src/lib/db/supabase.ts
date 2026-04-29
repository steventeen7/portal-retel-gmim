import { supabase } from '../supabase/client';
import { supabaseAdmin } from '../supabase/admin';
import { User, SoalTes, NilaiUser, SoalWawancara, Materi, localDB } from './local';

function isUUID(uuid: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export const supabaseDB = {
  users: {
    async findByEmail(email: string): Promise<User | undefined> {
      const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
      return data || undefined;
    },
    async findById(id: string): Promise<User | undefined> {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
        return data || undefined;
      } catch {
        return undefined;
      }
    },
    async create(data: any): Promise<any> {
      const { data: newUser, error } = await supabaseAdmin
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
      const { data } = await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    async update(id: string, data: any): Promise<any> {
      try {
        const { data: updated, error } = await supabaseAdmin
          .from('profiles')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return updated;
      } catch (err) {
        throw err;
      }
    },
    async delete(id: string): Promise<boolean> {
      try {
        const { error } = await supabaseAdmin.from('profiles').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        throw err;
      }
    }
  },

  soalTes: {
    async findByTahun(tahun: number): Promise<SoalTes[]> {
      try {
        const { data, error } = await supabase.from('soal_tes').select('*').eq('tahun', tahun).order('nomor_soal');
        if (!error && data && data.length > 0) return data;
      } catch (err) { }
      return localDB.soalTes.findByTahun(tahun);
    },
    async findAll(): Promise<SoalTes[]> {
      try {
        const { data, error } = await supabase.from('soal_tes').select('*').order('tahun', { ascending: false }).order('nomor_soal');
        if (!error && data && data.length > 0) return data;
      } catch (err) { }
      return localDB.soalTes.findAll();
    },
    async getTahunList(): Promise<number[]> {
      try {
        const { data, error } = await supabase.from('soal_tes').select('tahun');
        if (!error && data && data.length > 0) {
          const tahunSet = new Set(data.map(d => d.tahun));
          return Array.from(tahunSet).sort((a, b) => b - a);
        }
      } catch (err) { }
      return localDB.soalTes.getTahunList();
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
      try {
        const { data, error } = await supabase.from('soal_wawancara').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) { }
      return localDB.soalWawancara.findAll();
    },
    async findByKategori(kategori: string): Promise<SoalWawancara[]> {
      try {
        const { data, error } = await supabase.from('soal_wawancara').select('*').eq('kategori', kategori);
        if (!error && data && data.length > 0) return data;
      } catch (err) { }
      return localDB.soalWawancara.findByKategori(kategori);
    }
  },

  materi: {
    async findAll(): Promise<Materi[]> {
      try {
        const { data, error } = await supabase.from('materi_belajar').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) { }
      return localDB.materi.findAll();
    },
    async findByKategori(kategori: string): Promise<Materi[]> {
      try {
        const { data, error } = await supabase.from('materi_belajar').select('*').eq('kategori', kategori);
        if (!error && data && data.length > 0) return data;
      } catch (err) { }
      return localDB.materi.findByKategori(kategori);
    },
    async findById(id: number): Promise<Materi | undefined> {
      try {
        const { data, error } = await supabase.from('materi_belajar').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) { }
      return localDB.materi.findById(id);
    },
    async create(data: any): Promise<any> {
      const { data: res, error } = await supabase.from('materi_belajar').insert([data]).select().single();
      if (error) throw error;
      return res;
    },
    async update(id: number, data: any): Promise<any> {
      const { data: res, error } = await supabase.from('materi_belajar').update(data).eq('id', id).select().single();
      if (error) throw error;
      return res;
    },
    async delete(id: number): Promise<boolean> {
      const { error } = await supabase.from('materi_belajar').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  keywords: {
    async findAll(): Promise<any[]> {
      try {
        const { data, error } = await supabase.from('kata_kunci').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) { }
      return localDB.keywords.findAll();
    }
  },

  tigaBesar: {
    async findAll(): Promise<any[]> {
      try {
        const { data, error } = await supabase.from('soal_tiga_besar').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) { }
      return localDB.tigaBesar.findAll();
    }
  },

  simulationHistory: {
    async create(data: any): Promise<any> {
      const { data: result, error } = await supabase.from('simulation_history').insert([data]).select().single();
      if (error) throw error;
      return result;
    },
    async findByUser(userId: string): Promise<any[]> {
      const { data } = await supabase.from('simulation_history').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      return data || [];
    }
  },

  logs: {
    async create(userId: string, activity: string): Promise<void> {
      await supabaseAdmin.from('activity_logs').insert([{ user_id: userId, activity, timestamp: new Date().toISOString() }]);
    },
    async findAll(): Promise<any[]> {
      const { data } = await supabaseAdmin.from('activity_logs').select('*, profiles(full_name)').order('timestamp', { ascending: false });
      return data || [];
    }
  },

  chat: {
    async getMessages(): Promise<any[]> {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .is('to_id', null) // Only public messages
        .order('created_at', { ascending: true })
        .limit(100);
      return data || [];
    },
    async getPrivateMessages(userId: string, targetId: string): Promise<any[]> {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(from_id.eq.${userId},to_id.eq.${targetId}),and(from_id.eq.${targetId},to_id.eq.${userId})`)
        .order('created_at', { ascending: true });
      return data || [];
    },
    async createMessage(fromId: string, fromName: string, message: string, toId: string | null = null): Promise<any> {
      const { data, error } = await supabaseAdmin
        .from('chat_messages')
        .insert([{
          from_id: fromId,
          from_name: fromName,
          to_id: toId,
          message,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async findAllLogs(): Promise<any[]> {
      const { data } = await supabaseAdmin
        .from('chat_messages')
        .select('*, sender:profiles!from_id(full_name), recipient:profiles!to_id(full_name)')
        .order('created_at', { ascending: false });
      return data || [];
    }
  },

  presence: {
    async ping(userId: string): Promise<void> {
      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', userId);
    },
    async getOnlineUsers(): Promise<any[]> {
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, last_seen')
        .gt('last_seen', oneMinuteAgo);
      return data?.map(u => ({ id: u.id, name: u.full_name })) || [];
    }
  }
};
