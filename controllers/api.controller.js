// Basic API Controller

exports.getStatus = (req, res) => {
    res.json({
        success: true,
        message: 'DiagNova API is running smoothly.',
        version: '1.0.0'
    });
};

const { GoogleGenAI } = require('@google/genai');

exports.analyzeSymptoms = async (req, res) => {
    const { symptoms } = req.body;
    
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide symptoms for analysis.'
        });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `Analyze the following symptoms and provide a potential diagnosis, recommendation, and severity level (Mild, Moderate, Critical, or Unknown).
Symptoms: ${symptoms}

Respond ONLY with a valid JSON object in the exact following format:
{
  "disease": "Name of the potential condition",
  "recommendation": "Brief recommendation for the user",
  "severity": "Mild, Moderate, Critical, or Unknown"
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });
        
        const text = response.text;
        const result = JSON.parse(text);
        
        res.json({
            success: true,
            disease: result.disease || 'Unknown Condition',
            recommendation: result.recommendation || 'Please consult a healthcare professional.',
            severity: result.severity || 'Unknown'
        });
    } catch (error) {
        console.error("Error analyzing symptoms with Gemini:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze symptoms dynamically. Please try again later.'
        });
    }
};

exports.loginUser = (req, res) => {
    const { email, password } = req.body;
    
    // Placeholder for future database and JWT auth
    if (email && password) {
        res.json({
            success: true,
            message: 'Authentication successful. Welcome to DiagNova.',
            token: 'mock-jwt-token-12345'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials.'
        });
    }
};

exports.getNearbyHelp = async (req, res) => {
    const { lat, lng, query } = req.body;
    
    if (!lat || !lng) {
        return res.status(400).json({
            success: false,
            message: 'Location coordinates are required.'
        });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `I am at latitude ${lat} and longitude ${lng}. Please provide a realistic, short list of 3-5 nearby ${query || 'hospitals and clinics'} that would be accessible from my location. If you can't determine the exact city, provide plausible real facilities for the nearest major city to those coordinates. Format the output with markdown bullet points and bolding. Do not include introductory text, just the list with names and contact details.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        
        res.json({
            success: true,
            facilities: response.text
        });
    } catch (error) {
        console.error("Error fetching nearby help with Gemini:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve nearby facilities. Please try again later.'
        });
    }
};
