import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Entry = {
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  advice: string;
  date: string;
};

export default function SummaryScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [weeklySentiment, setWeeklySentiment] = useState<string>('');

  useEffect(() => {
    const fetchEntries = async () => {
      const stored = await AsyncStorage.getItem('entries');
      const parsed: Entry[] = stored ? JSON.parse(stored) : [];
      const last7 = parsed.slice(-7); // son 7 günü al
      setEntries(last7);

      if (last7.length > 0) {
        const score = last7.reduce((acc, curr) => {
          if (curr.sentiment === 'positive') return acc + 1;
          if (curr.sentiment === 'negative') return acc - 1;
          return acc;
        }, 0);

        if (score > 0) setWeeklySentiment('Positive Week 😊');
        else if (score < 0) setWeeklySentiment('Negative Week 😢');
        else setWeeklySentiment('Neutral Week 😐');
      }
    };
    fetchEntries();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Summary</Text>
      <Text style={styles.weeklySentiment}>{weeklySentiment}</Text>
      {entries.map((entry, index) => (
        <View key={index} style={styles.entry}>
          <Text>{entry.date}</Text>
          <Text>Duygu: {entry.sentiment}</Text>
          <Text>Özet: {entry.summary}</Text>
          <Text>Öneri: {entry.advice}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  weeklySentiment: { fontSize: 20, marginBottom: 16, textAlign: 'center' },
  entry: { marginBottom: 12, padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
});
