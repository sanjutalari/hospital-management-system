import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// AI Symptom Analysis with OpenAI/Gemini integration
router.post('/analyze', authenticate, async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || symptoms.length < 5) {
      return res.status(400).json({ success: false, error: 'Please describe your symptoms in more detail.' });
    }

    let analysis;

    // Check if OpenAI API key is configured
    if (process.env.OPENAI_API_KEY) {
      try {
        // Real OpenAI integration
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a medical AI assistant. Analyze symptoms and provide possible diagnoses with advice. Always emphasize this is not a definitive diagnosis. Format response as JSON with: diagnosis, advice, riskLevel (Low/Medium/High), specialist.'
              },
              {
                role: 'user',
                content: `Patient symptoms: ${symptoms}`
              }
            ],
            temperature: 0.7,
            max_tokens: 300
          })
        });

        if (!response.ok) {
          throw new Error('OpenAI API error');
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // Try to parse JSON response, fallback to text
        try {
          analysis = JSON.parse(aiResponse);
        } catch {
          analysis = {
            diagnosis: "AI Analysis",
            advice: aiResponse,
            riskLevel: "Medium",
            specialist: "General Physician"
          };
        }
      } catch (apiError) {
        console.error('OpenAI API Error:', apiError);
        // Fallback to mock responses if API fails
        analysis = getMockResponse(symptoms);
      }
    } else {
      // Use mock responses if no API key configured
      analysis = getMockResponse(symptoms);
    }

    res.json({
      success: true,
      analysis,
      usingRealAI: !!process.env.OPENAI_API_KEY,
      disclaimer: "This is an AI-assisted suggestion. It is NOT a definitive diagnosis. Please consult a qualified medical professional for any health concerns."
    });
  } catch (err) {
    next(err);
  }
});

// Mock AI responses for development/fallback
function getMockResponse(symptoms) {
  const mockResponses = [
    {
      diagnosis: "Common Cold / Seasonal Allergy",
      advice: "Rest, hydrate, and monitor your temperature. If symptoms persist for more than 7 days, consult a doctor.",
      riskLevel: "Low",
      specialist: "General Physician"
    },
    {
      diagnosis: "Tension Headache",
      advice: "Reduce screen time, maintain hydration, and ensure adequate sleep. If headache is severe or sudden, seek immediate care.",
      riskLevel: "Low",
      specialist: "Neurologist"
    },
    {
      diagnosis: "Minor Gastritis",
      advice: "Avoid spicy foods and caffeine. Eat smaller, frequent meals. If pain worsens, see a specialist.",
      riskLevel: "Medium",
      specialist: "Gastroenterologist"
    }
  ];

  const text = symptoms.toLowerCase();
  let suggestion = mockResponses[0];
  
  if (text.includes('head') || text.includes('migraine')) {
    suggestion = mockResponses[1];
  } else if (text.includes('stomach') || text.includes('acid') || text.includes('pain')) {
    suggestion = mockResponses[2];
  }

  return suggestion;
}

export default router;
