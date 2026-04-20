import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || 'dummy_api_key_to_prevent_crash',
  dangerouslyAllowBrowser: true // Digunakan di sisi client untuk simulasi latihan mandiri
});

export type EvalResult = {
  content: number;
  correlation: number;
  performance: number;
  feedback: string;
};

export async function evaluateAnswer(category: string, question: string, answer: string): Promise<EvalResult> {
  const prompt = `
    Anda adalah seorang juri profesional dalam pemilihan Remaja Teladan GMIM (Gereja Masehi Injili di Minahasa).
    Tugas Anda adalah menilai jawaban peserta simulasi wawancara.
    
    Kategori: ${category}
    Pertanyaan: ${question}
    Jawaban Peserta: ${answer}
    
    Berikan penilaian dalam skala 1-100 untuk kriteria berikut:
    1. Content: Apakah jawaban relevan, substantif, dan faktual?
    2. Correlation: Apakah jawaban dihubungkan dengan nilai-nilai Kristiani, Alkitab, atau visi Remaja GMIM?
    3. Performance: (Berdasarkan teks) Apakah struktur bahasa menunjukkan ketenangan dan keyakinan?
    
    Format balasan Anda harus dalam JSON murni:
    {
      "content": number,
      "correlation": number,
      "performance": number,
      "feedback": "string (singkat & motivatif dalam Bahasa Indonesia)"
    }
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(chatCompletion.choices[0].message.content || '{}');
    return {
      content: result.content || 0,
      correlation: result.correlation || 0,
      performance: result.performance || 0,
      feedback: result.feedback || 'Gagal mengevaluasi jawaban.',
    };
  } catch (error) {
    console.error('Groq Eval Error:', error);
    return {
      content: 0,
      correlation: 0,
      performance: 0,
      feedback: 'Terjadi kesalahan pada sistem AI.',
    };
  }
}

export async function evaluateKeyword(keywords: string[], explanation: string): Promise<EvalResult> {
  const prompt = `
    Anda adalah juri Pemilihan Remaja Teladan GMIM. Peserta harus menjelaskan hubungan antara 3 kata kunci berikut: ${keywords.join(', ')}.
    
    Penjelasan Peserta: ${explanation}
    
    Berikan penilaian JSON:
    {
      "content": number,
      "correlation": number,
      "performance": number,
      "feedback": "string (Bahasa Indonesia)"
    }
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    return JSON.parse(chatCompletion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Groq Keyword Eval Error:', error);
    return { content: 0, correlation: 0, performance: 0, feedback: 'Error AI.' };
  }
}
