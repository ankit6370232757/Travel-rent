const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithGemini = async(req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        // 1. Configure the Model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 2. Set Context/Persona (Optional but recommended)
        // This tells Gemini who it is so it answers correctly for your app.
        const contextPrompt = `
      You are the AI Support Assistant for "TravelRent", an investment platform where users buy packages (Water, Earth, Air, Fire, Space, X1) to earn daily, monthly, or yearly income.
      
      Key Info:
      - Packages: Water ($50), Earth ($150), ... X1 ($1.15M - Daily Income $15k).
      - Withdrawals: Minimum $10.
      - Support Email: support@travelrent.com.
      
      User Question: ${message}
      
      Keep your answer helpful, short, and professional.
    `;

        // 3. Generate Response
        const result = await model.generateContent(contextPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("Gemini Chat Error:", error);
        res.status(500).json({ message: "I'm having trouble thinking right now. Please try again." });
    }
};