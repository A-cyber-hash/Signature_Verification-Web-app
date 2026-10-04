import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Close,
} from '@mui/icons-material';
import { useLanguage } from '@context/LanguageContext';

const AI_SUGGESTIONS = {
  en: [
    'Verify Your Signature',
    'Upload Multiple Signatures',
    'View Verification History',
    'How accurate is the system?',
    'What is genuine signature?',
  ],
  hi: [
    'अपने हस्ताक्षर को सत्यापित करें',
    'कई हस्ताक्षर अपलोड करें',
    'सत्यापन इतिहास देखें',
    'सिस्टम कितना सटीक है?',
    'असली हस्ताक्षर क्या है?',
  ],
};

const AI_RESPONSES = {
  en: {
    'Verify Your Signature': 'You can verify your signature by capturing it with your camera or uploading an image. Our AI will analyze it and provide a confidence score.',
    'Upload Multiple Signatures': 'Yes, you can upload multiple signatures for comparison. This helps improve the accuracy of our verification system.',
    'View Verification History': 'All your verification results are saved in your history. You can access them anytime from the dashboard.',
    'How accurate is the system?': 'Our system has 99.7% accuracy rate with advanced AI algorithms. It analyzes pressure, speed, angle, and other features.',
    'What is genuine signature?': 'A genuine signature is one that matches the registered signature of the person. Our AI compares multiple features to verify authenticity.',
  },
  hi: {
    'अपने हस्ताक्षर को सत्यापित करें': 'आप अपने कैमरे से हस्ताक्षर कैप्चर करके या छवि अपलोड करके सत्यापित कर सकते हैं। हमारा एआई इसका विश्लेषण करेगा।',
    'कई हस्ताक्षर अपलोड करें': 'हां, आप तुलना के लिए कई हस्ताक्षर अपलोड कर सकते हैं। यह हमारे सत्यापन सिस्टम की सटीकता में सुधार करता है।',
    'सत्यापन इतिहास देखें': 'आपके सभी सत्यापन परिणाम आपके इतिहास में सहेजे जाते हैं। आप उन्हें डैशबोर्ड से कभी भी एक्सेस कर सकते हैं।',
    'सिस्टम कितना सटीक है?': 'हमारे सिस्टम की सटीकता 99.7% है। यह दबाव, गति, कोण और अन्य विशेषताओं का विश्लेषण करता है।',
    'असली हस्ताक्षर क्या है?': 'असली हस्ताक्षर वह है जो व्यक्ति के पंजीकृत हस्ताक्षर से मेल खाता है। हमारा एआई प्रामाणिकता सत्यापित करने के लिए कई विशेषताओं की तुलना करता है।',
  },
};

export default function AIChatbot() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: t('howCanIHelp'),
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    setTimeout(() => {
      const response = AI_RESPONSES[language]?.[text] || 
        AI_RESPONSES.en[text] ||
        'I understand your question. Our AI system is designed to verify signatures with high accuracy. How else can I help you?';

      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        text: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  };

  const suggestions = AI_SUGGESTIONS[language] || AI_SUGGESTIONS.en;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '600px' }}>
      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          background: 'linear-gradient(145deg, rgba(30,41,59,.5), rgba(15,23,42,.5))',
          borderRadius: 2,
          mb: 2,
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              gap: 1,
            }}
          >
            {message.type === 'ai' && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                }}
              >
                <SmartToy sx={{ fontSize: 18 }} />
              </Avatar>
            )}

            <Box
              sx={{
                maxWidth: '70%',
                p: 1.5,
                borderRadius: 2,
                background:
                  message.type === 'user'
                    ? 'linear-gradient(135deg, #14b8a6, #0ea5e9)'
                    : 'rgba(148,163,184,.1)',
                border:
                  message.type === 'ai'
                    ? '1px solid rgba(148,163,184,.2)'
                    : 'none',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: message.type === 'user' ? '#fff' : '#f1f5f9',
                }}
              >
                {message.text}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: message.type === 'user' ? 'rgba(255,255,255,.6)' : '#94a3b8',
                  mt: 0.5,
                  display: 'block',
                }}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>

            {message.type === 'user' && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'rgba(148,163,184,.2)',
                }}
              >
                <Person sx={{ fontSize: 18 }} />
              </Avatar>
            )}
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
              }}
            >
              <SmartToy sx={{ fontSize: 18 }} />
            </Avatar>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(148,163,184,.1)' }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#14b8a6',
                    animation: 'bounce 1.4s infinite',
                  }}
                />
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#14b8a6',
                    animation: 'bounce 1.4s infinite 0.2s',
                  }}
                />
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#14b8a6',
                    animation: 'bounce 1.4s infinite 0.4s',
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Suggestions */}
      {messages.length === 1 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            {t('suggestions')}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {suggestions.map((suggestion, idx) => (
              <Chip
                key={idx}
                label={suggestion}
                onClick={() => handleSendMessage(suggestion)}
                sx={{
                  background: 'rgba(20,184,166,.1)',
                  border: '1px solid rgba(20,184,166,.3)',
                  color: '#14b8a6',
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'rgba(20,184,166,.2)',
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Input Area */}
      <Stack direction="row" spacing={1}>
        <TextField
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={t('typeMessage')}
          size="small"
          fullWidth
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: 'rgba(148,163,184,.1)',
              borderRadius: 2,
            },
          }}
        />
        <Button
          variant="contained"
          onClick={() => handleSendMessage()}
          disabled={loading || !inputValue.trim()}
          sx={{
            background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
            minWidth: 'auto',
            px: 2,
          }}
        >
          <Send sx={{ fontSize: 18 }} />
        </Button>
      </Stack>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </Box>
  );
}
