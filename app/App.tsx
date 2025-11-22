import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DailyScreen from './tabs/daily';
import HistoryScreen from './tabs/history';



// Basit Navigasyon Tipleri
type ScreenName = 'DailyEntry' | 'History';

export default function App() {
    // State tabanlı basit navigasyon yönetimi (Context/Redux yerine bu MVP için yeterlidir)
    const [currentScreen, setCurrentScreen] = useState<ScreenName>('DailyEntry');

    const navigate = (screenName: ScreenName) => {
        setCurrentScreen(screenName);
    };

    return (
        <View style={styles.container}>
            {currentScreen === 'DailyEntry' ? (
                <DailyScreen navigateToHistory={() => navigate('History')} />
            ) : (
                <HistoryScreen navigateToDailyEntry={() => navigate('DailyEntry')} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});