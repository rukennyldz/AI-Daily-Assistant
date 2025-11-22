import AsyncStorage from '@react-native-async-storage/async-storage';

// =========================================================
// YAPILANDIRMA VE SABİTLER
// =========================================================

// ÖNEMLİ: Kendi Hugging Face API Anahtarınızla değiştirin.
export const HF_TOKEN = "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"; 
// İngilizce sentiment analizi için model endpoint'i
export const HF_API_URL = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english";

// Duygu Durumu Tipleri
export type SentimentType = 'positive' | 'neutral' | 'negative' | 'default';

// Girdi Yapısı
export interface DailyEntry {
    id: number;
    date: string;
    text: string;
    sentiment: SentimentType;
    summary: string;
    advice: string;
}

// Duygu Durumuna Göre Renkler (UI/UX Gereksinimi)
export const SENTIMENT_COLORS: Record<SentimentType, { primary: string, accent: string, text: string }> = {
    'positive': { primary: '#FEEB9A', accent: '#D9B44A', text: '#333' }, // Sarı tonları
    'neutral': { primary: '#B2B2B2', accent: '#666666', text: '#fff' }, // Gri tonları
    'negative': { primary: '#E06C75', accent: '#983C48', text: '#fff' }, // Kırmızı tonları
    'default': { primary: '#F7F7F7', accent: '#3498db', text: '#333' }, // Varsayılan/Giriş
};

// =========================================================
// ASYNC STORAGE İŞLEMLERİ
// =========================================================

const STORAGE_KEY = 'daily_entries';

/**
 * AsyncStorage'e yeni girdi kaydeder.
 */
export const saveEntry = async (entry: Omit<DailyEntry, 'id' | 'date'>): Promise<boolean> => {
    try {
        const existingEntries = await AsyncStorage.getItem(STORAGE_KEY);
        const entries: DailyEntry[] = existingEntries ? JSON.parse(existingEntries) : [];
        
        const newEntry: DailyEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...entry,
        };
        entries.unshift(newEntry);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        return true;
    } catch (e) {
        console.error("Girdi kaydederken hata oluştu:", e);
        return false;
    }
};

/**
 * AsyncStorage'den tüm girdileri çeker. (Çevrimdışı okuma)
 */
export const loadEntries = async (): Promise<DailyEntry[]> => {
    try {
        const existingEntries = await AsyncStorage.getItem(STORAGE_KEY);
        return existingEntries ? JSON.parse(existingEntries) : [];
    } catch (e) {
        console.error("Girdileri çekerken hata oluştu:", e);
        return [];
    }
};

// =========================================================
// AI VE YARDIMCI MANTIK
// =========================================================

/**
 * Hugging Face API'ye metin gönderip duygu analizi yapar.
 */
export const analyzeSentiment = async (text: string): Promise<SentimentType> => {
    try {
        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: text }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("API Yanıt Hatası:", errorBody);
            // Hata durumunda nötr döndür
            return 'neutral'; 
        }

        const result = await response.json();
        const scores = result?.[0];

        if (scores && scores.length > 0) {
            let currentSentiment: SentimentType = 'neutral';
            let maxScore = 0;

            scores.forEach((item: { label: string, score: number }) => {
                if (item.score > maxScore) {
                    maxScore = item.score;
                    if (item.label === 'POSITIVE') currentSentiment = 'positive';
                    else if (item.label === 'NEGATIVE') currentSentiment = 'negative';
                    // Diğer durumlarda veya skorlar düşükse nötr kalır
                }
            });
            return currentSentiment;
        }

        return 'neutral'; // Geçerli sonuç yoksa
    } catch (error) {
        console.error("AI Analiz Hatası:", error);
        return 'neutral'; // Bağlantı hatası veya diğer hatalar
    }
};


/**
 * Duyguya göre basit bir özet metni döndürür (Proje Gereksinimi)
 */
export const getSummary = (sentiment: SentimentType): string => {
    switch (sentiment) {
        case 'positive':
            return "Bugün genel olarak olumlu bir gün geçirmişsin. Süper!";
        case 'negative':
            return "Zorlayıcı duygular yaşamış olabilirsin. Unutma, bu sadece bir an.";
        case 'neutral':
        case 'default':
        default:
            return "Oldukça sakin ve dengeli bir gün geçirmişsin.";
    }
};

/**
 * Duyguya göre basit bir öneri metni döndürür (Proje Gereksinimi)
 */
export const getAdvice = (sentiment: SentimentType): string => {
    switch (sentiment) {
        case 'positive':
            return "Harika! Bu pozitif enerjiyi korumak için bugün küçük bir kutlama yapabilirsin.";
        case 'negative':
            return "Kendine 10 dakikalık bir mola verebilirsin. Sevdiğin sakin bir aktiviteye odaklan.";
        case 'neutral':
        case 'default':
        default:
            return "Dengen iyi. Belki küçük bir hedef belirleyip onu gerçekleştirmeye odaklanabilirsin.";
    }
};