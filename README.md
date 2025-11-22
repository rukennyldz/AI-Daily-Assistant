# AI-Daily-Assistant
Bu proje, kullanıcının yazdığı günlük cümleleri/duyguları yapay zeka (AI) aracılığıyla analiz eden bir mobil asistan uygulamasıdır. Uygulama, metin girdilerine göre duygu analizi, basit bir özet ve kişiselleştirilmiş bir öneri sunar. Tüm veriler AsyncStorage (lokal) kullanılarak depolanır ve çevrimdışı görüntülenebilir.
Klasör Yapısı :
<img width="1422" height="815" alt="Ekran Resmi 2025-11-22 01 23 06" src="https://github.com/user-attachments/assets/329da4c9-f78f-4cae-9a0a-d45c4cf2d4d1" />
AI Modeli Açıklaması:
Kullanılan Model: distilbert-base-uncased-finetuned-sst-2-english 

Platform: Hugging Face Inference API

Çalışma Prensibi: Model İngilizce metni alıp POSITIVE veya NEGATIVE olarak etiketler. Uygulama bu etiketleri, Duygu Analizi (pozitif/nötr/negatif), Basit Özet ve Öneri çıktılarına dönüştürür.
AI Araç Kullanım Dokümantasyonu:

Bu proje taslağı, belirlenen tüm gereksinimleri (React Native CLI/TypeScript formatı, AsyncStorage, Hugging Face API entegrasyonu ve modüler dosya yapısı) karşılamak amacıyla Gemini tarafından oluşturulmuştur.
Kurulum ve Çalıştırma Adımları:
Ön Koşullar: Node.js, npm/yarn, React Native CLI ortamınızın (JDK, Android Studio/Xcode) kurulu olduğundan emin olun.

React Native CLI Projesi Oluşturma (TypeScript):

npx react-native init AIDailyAssistant --template react-native-template-typescript
cd AIDailyAssistant


Gerekli Paketleri Kurma:

npm install @react-native-async-storage/async-storage react-native-safe-area-context
# VEYA
yarn add @react-native-async-storage/async-storage react-native-safe-area-context


Yerel Kurulumları Tamamlama (iOS/Android):

npx pod-install # iOS için


Dosyaları Yerleştirme:
Yukarıdaki dosyaları belirtilen klasörlere (örneğin daily.tsx dosyasını app/daily.tsx yoluna) kopyalayıp yapıştırın.

AI API Anahtarını Ayarlama (ÇOK ÖNEMLİ):
utils/storage.ts dosyasını açın ve HF_TOKEN değişkenini kendi Hugging Face API erişim jetonunuz ile değiştirin:

export const HF_TOKEN = "hf_INSERT_YOUR_HUGGINGFACE_TOKEN_HERE"; 


Uygulamayı Çalıştırma:

npx react-native run-android
# VEYA
npx react-native run-ios
