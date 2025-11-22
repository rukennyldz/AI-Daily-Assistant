import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DailyEntry,
  loadEntries,
  SENTIMENT_COLORS,
  SentimentType
} from '../storage';

interface HistoryScreenProps {
    navigateToDailyEntry: () => void;
}

export default function HistoryScreen({ navigateToDailyEntry }: HistoryScreenProps) {
    const [entries, setEntries] = useState<DailyEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Girdileri yükle (Offline Çalışma ve Geçmiş Ekranı Gereksinimi)
    const fetchEntries = async () => {
        setLoading(true);
        const data = await loadEntries();
        setEntries(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchEntries();
        // Basit bir dinleyici veya state değişikliği tetikleyici ekleyebilirsiniz.
    }, []);

    const getSentimentEmoji = (sentiment: SentimentType) => {
        switch (sentiment) {
            case 'positive': return '🤩';
            case 'negative': return '😔';
            case 'neutral': return '😶';
            default: return '❓';
        }
    };
    
    // Basit Haftalık Özet Hesaplaması (Proje Gereksinimi)
    const getWeeklySummary = (): string => {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        // Son bir haftadaki girdileri filtrele
        const lastWeekEntries = entries.filter(e => new Date(e.date).getTime() > oneWeekAgo);

        if (lastWeekEntries.length === 0) return "Bu hafta yeterli girdi bulunamadı.";

        let positiveCount = 0;
        let negativeCount = 0;

        lastWeekEntries.forEach(e => {
            if (e.sentiment === 'positive') positiveCount += 1;
            else if (e.sentiment === 'negative') negativeCount += 1;
        });

        const total = lastWeekEntries.length;
        const percentage = ((positiveCount / total) * 100).toFixed(0);

        if (positiveCount > negativeCount + 2) return `Geçen hafta ${total} girdi ile %${percentage} oranında pozitif bir eğilim sergilemişsin. Harika!`;
        if (negativeCount > positiveCount + 2) return `Geçen hafta negatif eğilim yüksekti. Kendine biraz daha zaman ayırmalısın.`;
        return `Geçen hafta genel duygu durumun dengeli (${total} girdi).`;
    };


    const renderItem = (item: DailyEntry) => {
        const itemColors = SENTIMENT_COLORS[item.sentiment] || SENTIMENT_COLORS.default;
        // Tarih formatlama
        const date = new Date(item.date).toLocaleDateString('tr-TR', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return (
            <View key={item.id} style={[styles.historyItem, { backgroundColor: itemColors.primary, borderLeftColor: itemColors.accent }]}>
                <View style={styles.historyTextContent}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyEmoji}>{getSentimentEmoji(item.sentiment)}</Text>
                        <Text style={styles.historyDate}>{date} | {item.sentiment.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.historySummary}>{item.summary}</Text>
                    <Text style={styles.historyText} numberOfLines={2}>Girdi: "{item.text}"</Text>
                    <Text style={styles.historyAdvice}>Öneri: {item.advice}</Text>
                </View>
            </View>
        );
    };


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: SENTIMENT_COLORS.default.primary }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={navigateToDailyEntry} style={styles.historyButton}>
                    <Text style={styles.historyButtonText}>← Geri</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Geçmiş Girdiler</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.weeklySummaryBox}>
                <Text style={styles.weeklySummaryTitle}>Haftalık Özet 📊</Text>
                <Text style={styles.weeklySummaryText}>{getWeeklySummary()}</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 50 }} />
            ) : entries.length === 0 ? (
                <Text style={styles.emptyMessage}>Henüz kaydedilmiş bir girdi yok.</Text>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {entries.map(renderItem)}
                    <View style={{ height: 50 }} />
                </ScrollView>
            )}
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
        color: '#3498db',
        fontWeight: '600',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100, 
    },
    weeklySummaryBox: {
        margin: 20,
        padding: 15,
        backgroundColor: '#ecf0f1',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bdc3c7',
    },
    weeklySummaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#2c3e50',
    },
    weeklySummaryText: {
        fontSize: 15,
        color: '#34495e',
    },
    historyItem: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderLeftWidth: 4, // Duygu rengi ile gösterim
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    historyEmoji: {
        fontSize: 24,
        marginRight: 10,
    },
    historyTextContent: {
        flex: 1,
    },
    historyDate: {
        fontSize: 13,
        color: '#555',
        fontWeight: 'bold',
    },
    historySummary: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        color: '#333',
    },
    historyText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    historyAdvice: {
        fontSize: 14,
        color: '#2980b9',
        fontStyle: 'italic',
    },
    emptyMessage: {
        fontSize: 18,
        color: '#7f8c8d',
        textAlign: 'center',
        marginTop: 50,
    }
});