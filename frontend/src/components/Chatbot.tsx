import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { usePatient } from '../contexts/PatientContext';

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const { patient } = usePatient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !patient) return;

    const userMessage: Message = {
      text: input,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: input,
        patientName: patient.name,
        patientGeburtsdatum: patient.geburtsdatum
      });

      const botMessage: Message = {
        text: response.data.response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError('Fehler bei der Kommunikation mit dem Chatbot. Bitte versuchen Sie es später erneut.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto', mt: 4, height: '600px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Praxis-Assistent
      </Typography>

      <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.isBot ? 'flex-start' : 'flex-end',
              mb: 2
            }}
          >
            <Paper
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: message.isBot ? 'primary.light' : 'secondary.light',
                color: message.isBot ? 'primary.contrastText' : 'secondary.contrastText'
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                {message.timestamp.toLocaleTimeString('de-DE')}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ihre Nachricht..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading || !patient}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={loading || !input.trim() || !patient}
          endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          Senden
        </Button>
      </Box>
    </Paper>
  );
};

export default Chatbot; 