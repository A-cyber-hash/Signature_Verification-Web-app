import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    dashboard: 'Dashboard',
    verification: 'Verification',
    signatures: 'Signatures',
    analytics: 'Analytics',
    settings: 'Settings',
    chatbot: 'Chat Support',
    welcomeBack: 'Welcome Back',
    totalVerifications: 'Total Verifications',
    genuineSignatures: 'Genuine Signatures',
    forgedDetected: 'Forged Detected',
    accuracy: 'Accuracy',
    captureSignature: 'Capture Signature',
    uploadSignature: 'Upload Signature',
    verifyNow: 'Verify Now',
    verificationResult: 'Verification Result',
    genuine: 'Genuine',
    forged: 'Forged',
    confidence: 'Confidence',
    openCamera: 'Open Camera',
    takePhoto: 'Take Photo',
    retake: 'Retake',
    usePhoto: 'Use Photo',
    cameraPermission: 'Camera Permission Required',
    allowCamera: 'Allow Camera Access',
    chatSupport: 'Chat Support',
    typeMessage: 'Type your message...',
    send: 'Send',
    aiAssistant: 'AI Assistant',
    howCanIHelp: 'How can I help you today?',
    suggestions: 'Suggestions',
    verifySignature: 'Verify Your Signature',
    uploadMultiple: 'Upload Multiple Signatures',
    viewHistory: 'View Verification History',
    language: 'Language',
    english: 'English',
    hindi: 'हिंदी',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    verification: 'सत्यापन',
    signatures: 'हस्ताक्षर',
    analytics: 'विश्लेषण',
    settings: 'सेटिंग्स',
    chatbot: 'चैट सहायता',
    welcomeBack: 'स्वागत है',
    totalVerifications: 'कुल सत्यापन',
    genuineSignatures: 'असली हस्ताक्षर',
    forgedDetected: 'नकली पाया गया',
    accuracy: 'सटीकता',
    captureSignature: 'हस्ताक्षर कैप्चर करें',
    uploadSignature: 'हस्ताक्षर अपलोड करें',
    verifyNow: 'अभी सत्यापित करें',
    verificationResult: 'सत्यापन परिणाम',
    genuine: 'असली',
    forged: 'नकली',
    confidence: 'आत्मविश्वास',
    openCamera: 'कैमरा खोलें',
    takePhoto: 'फोटो लें',
    retake: 'फिर से लें',
    usePhoto: 'फोटो का उपयोग करें',
    cameraPermission: 'कैमरा अनुमति आवश्यक',
    allowCamera: 'कैमरा एक्सेस की अनुमति दें',
    chatSupport: 'चैट सहायता',
    typeMessage: 'अपना संदेश टाइप करें...',
    send: 'भेजें',
    aiAssistant: 'एआई सहायक',
    howCanIHelp: 'मैं आपकी कैसे मदद कर सकता हूं?',
    suggestions: 'सुझाव',
    verifySignature: 'अपने हस्ताक्षर को सत्यापित करें',
    uploadMultiple: 'कई हस्ताक्षर अपलोड करें',
    viewHistory: 'सत्यापन इतिहास देखें',
    language: 'भाषा',
    english: 'English',
    hindi: 'हिंदी',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफल',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    back: 'वापस',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
