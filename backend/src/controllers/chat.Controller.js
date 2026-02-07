// We use 'require' because your project is set up for CommonJS (Node.js default)
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.chatWithGemini = async(req, res) => {
    try {
        // 1. Initialize Gemini with your API Key
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Using the specific model you requested
        // (Note: If 2.0 fails, try changing this to "gemini-1.5-flash")
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Your frontend sends { "message": "..." }, so we read 'message' here.
        const { message } = req.body;

        if (!message) return res.status(400).json({ message: "Message is required!" });

        // 2. Define the personality of your AI (Travel Rent Context)
        const systemPrompt = `
            You are the TravelRent AI Assistant.
            TravelRent is a premium investment platform.
            
            Context: 
            - Users buy packages to earn daily income.
            - Packages: Water ($50), Earth ($150), Air ($500), Fire ($1000), Space ($5000).
            - VIP Package: X1 ($1.15M Entry -> $15,000 Daily Income).
            - Withdrawals: Minimum $10, processed within 24 hours.
            
            Keep your answers helpful, concise, and related to the TravelRent platform.
            
            User Query: ${message}
        `;

        // 3. Generate the response
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Send back 'reply' because your Frontend ChatBot expects 'res.data.reply'
        res.status(200).json({ reply: text });

    } catch (err) {
        console.error("Gemini API Error:", err);
        res.status(500).json({ message: "The assistant is having trouble thinking. Try again later." });
    }
};