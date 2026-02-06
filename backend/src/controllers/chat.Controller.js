const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.chatWithGemini = async(req, res) => {
    try {
        // 1. 🛡️ SECURITY CHECK: Is the API Key loaded?
        // This is the #1 cause of 500 errors on Render
        if (!process.env.GEMINI_API_KEY) {
            console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing in Environment Variables!");
            return res.status(500).json({
                message: "Server Error: API Key not configured."
            });
        }

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        // 2. Initialize Gemini (Do it inside to be safe)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // 3. Use 'gemini-1.5-flash' (Faster & Cheaper) or 'gemini-pro'
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 4. Set Context/Persona
        const contextPrompt = `
          You are the AI Support Assistant for "TravelRent", an investment platform where users buy packages (Water, Earth, Air, Fire, Space, X1) to earn daily, monthly, or yearly income.
          
          Key Info:
          - Packages: Water ($50), Earth ($150), Air ($500), Fire ($1000), Space ($5000), X1 ($1.15M - Daily Income $15k).
          - Withdrawals: Minimum $10.
          - Support Email: support@travelrent.com.
          
          User Question: ${message}
          
          Keep your answer helpful, short, and professional.
        `;

        // 5. Generate Response
        const result = await model.generateContent(contextPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        // 🔍 LOG THE REAL ERROR to Render Console
        console.error("❌ GEMINI API CRASH:", error);

        res.status(500).json({
            message: "I'm having trouble thinking right now. Please try again.",
            error: error.message // Optional: Send error detail to frontend for debugging
        });
    }
};