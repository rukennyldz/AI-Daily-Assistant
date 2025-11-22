import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  analyzeSentiment,
  getAdvice,
  getSummary,
  saveEntry,
  SENTIMENT_COLORS,
  SentimentType
} from '../storage';

// Props, ana uygulama dosyasından navigasyon fonksiyonunu içerir.
interface DailyScreenProps {
    navigateToHistory: () => void;
}

export default function DailyScreen({ navigateToHistory }: DailyScreenProps) {
    const [input, setInput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    // Sonuç state'leri
    const [sentiment, setSentiment] = useState<SentimentType>('default'); 
    const [summary, setSummary] = useState<string | null>(null);
    const [advice, setAdvice] = useState<string | null>(null);

    // Duygu durumuna göre arkaplan rengini alır
    const activeColors = SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.default;

    // AI Analiz ve Kayıt Fonksiyonu
    const handleAnalyze = async () => {
        if (!input.trim()) {
            Alert.alert('Uyarı', 'Lütfen günlük duygu veya düşüncenizi yazın.');
            return;
        }

        setLoading(true);
        setSentiment('default'); 
        setSummary(null);
        setAdvice(null);
        
        try {
            // 1. Duygu Analizi
            const currentSentiment = await analyzeSentiment(input);

            if (currentSentiment === 'neutral') {
                 // API token hatası veya modelin İngilizce metin beklentisi gibi durumlarda
                Alert.alert("Bilgi", "Analiz sonuçlanamadı veya nötr olarak belirlendi. Lütfen internet bağlantınızı ve girdi metninizi kontrol edin.");
            }
            
            // 2. Özet ve Öneri Üretimi (Proje Gereksinimi)
            const calculatedSummary = getSummary(currentSentiment);
            const calculatedAdvice = getAdvice(currentSentiment);

            // 3. State'leri Güncelle
            setSentiment(currentSentiment);
            setSummary(calculatedSummary);
            setAdvice(calculatedAdvice);

            // 4. Veriyi Lokal Olarak Kaydet (Proje Gereksinimi)
            await saveEntry({
                text: input,
                sentiment: currentSentiment,
                summary: calculatedSummary,
                advice: calculatedAdvice,
            });
            setInput(''); // Başarılı kaydedince input'u temizle

        } catch (error) {
            console.error("İşlem Hatası:", error);
            Alert.alert("Hata", "Analiz sırasında beklenmedik bir hata oluştu.");
            setSentiment('default'); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: activeColors.primary }]}>
            <View style={styles.header}>
                <Text style={styles.title}>AI Günlük Asistanım</Text>
                <TouchableOpacity onPress={navigateToHistory} style={styles.historyButton}>
                    <Text style={[styles.historyButtonText, { color: activeColors.accent }]}>Geçmiş 📅</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.label}>Bugünün Duygularını Yaz (İngilizce Önerilir):</Text>
                <TextInput
                    style={[styles.input, { borderColor: activeColors.accent }]}
                    onChangeText={setInput}
                    value={input}
                    placeholder="Örn: I feel motivated today but a bit tired."
                    multiline
                    numberOfLines={4}
                    editable={!loading}
                />

                <TouchableOpacity 
                    onPress={handleAnalyze}
                    disabled={loading || !input.trim()}
                    style={[styles.analyzeButton, { backgroundColor: activeColors.accent, opacity: (loading || !input.trim()) ? 0.6 : 1 }]}
                >
                    <Text style={styles.analyzeButtonText}>
                        {loading ? "Analiz Ediliyor..." : "Analiz Et ve Kaydet"}
                    </Text>
                </TouchableOpacity>

                {/* Sonuç Alanı */}
                {(sentiment !== 'default' || loading) && (
                    <View style={styles.resultContainer}>
                        {loading && <ActivityIndicator size="large" color={activeColors.accent} />}

                        {sentiment !== 'default' && !loading && summary && advice && (
                            <>
                                <Text style={styles.resultTitle}>Duygu Analizi: <Text style={{ color: activeColors.accent }}>{sentiment.toUpperCase()}</Text></Text>
                                {/* Basit Özet */}
                                <Text style={styles.resultSummary}>{summary}</Text>
                                <Text style={styles.resultAdviceLabel}>🤖 Asistan Önerisi:</Text>
                                {/* Öneri */}
                                <Text style={styles.resultAdvice}>{advice}</Text>
                            </>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#2c3e50',
    },
    historyButton: {
        padding: 5,
        borderRadius: 8,
    },
    historyButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    label: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
        color: '#2c3e50',
    },
    input: {
        height: 120,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
        textAlignVertical: 'top',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    analyzeButton: {
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    analyzeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultContainer: {
        padding: 20,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        minHeight: 150,
        justifyContent: 'center',
        borderLeftWidth: 5,
        borderLeftColor: '#3498db',
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#2c3e50',
    },
    resultSummary: {
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#555',
    },
    resultAdviceLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#34495e',
    },
    resultAdvice: {
        fontSize: 16,
        marginTop: 5,
        color: '#333',
    },
});