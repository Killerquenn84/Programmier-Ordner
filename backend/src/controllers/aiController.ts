import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import axios from 'axios';

// KI-gestützte Terminvorschläge
export const suggestAppointments = async (req: Request, res: Response) => {
  try {
    const { arztId, preferredDates, preferredTimes, patientName } = req.body;

    // Bestehende Termine des Arztes abrufen
    const existingAppointments = await Appointment.find({
      arztId,
      status: { $in: ['bestätigt', 'angefragt'] }
    });

    // KI-Anfrage an OpenAI/OpenRouter
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Assistent für die Terminplanung in einer Arztpraxis. Deine Aufgabe ist es, passende Termine basierend auf den Präferenzen des Patienten und den bereits gebuchten Terminen vorzuschlagen.'
          },
          {
            role: 'user',
            content: `Bitte schlage Termine für ${patientName} vor. 
            Bevorzugte Tage: ${preferredDates.join(', ')}
            Bevorzugte Uhrzeiten: ${preferredTimes.join(', ')}
            Bereits gebuchte Termine: ${JSON.stringify(existingAppointments)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // KI-Antwort verarbeiten und Terminvorschläge extrahieren
    const suggestions = response.data.choices[0].message.content;
    
    // Hier könnte man die Vorschläge noch weiter verarbeiten und in ein strukturiertes Format bringen

    res.json({
      message: 'Terminvorschläge erfolgreich generiert',
      suggestions
    });
  } catch (error) {
    console.error('Fehler bei der KI-Anfrage:', error);
    res.status(500).json({ message: 'Server-Fehler bei der Generierung der Terminvorschläge', error });
  }
};

// Chatbot für Termin-Fragen
export const chatWithBot = async (req: Request, res: Response) => {
  try {
    const { message, patientName, patientGeburtsdatum } = req.body;

    // Patienten-Termine abrufen
    const patientAppointments = await Appointment.find({
      patientName,
      patientGeburtsdatum
    });

    // KI-Anfrage an OpenAI/OpenRouter
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein hilfreicher Assistent für eine Arztpraxis. Beantworte Fragen zu Terminen und der Praxis.'
          },
          {
            role: 'user',
            content: `Patient: ${patientName}
            Termine: ${JSON.stringify(patientAppointments)}
            Frage: ${message}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const botResponse = response.data.choices[0].message.content;

    res.json({
      message: 'Chatbot-Antwort erfolgreich generiert',
      response: botResponse
    });
  } catch (error) {
    console.error('Fehler bei der Chatbot-Anfrage:', error);
    res.status(500).json({ message: 'Server-Fehler bei der Chatbot-Antwort', error });
  }
}; 