const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const { STATUS } = require('../constants');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

router.post('/', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage || !userMessage.trim()) {
        return res.status(STATUS.BAD_REQUEST).json({
        response: "Hello! I'm BloomBot. How can I help you today?"
        });
    }

   const prompt = `You are BloomBot, a soft-spoken, thoughtful wellness companion. Your tone is gentle, nurturing, and emotionally supportive. You are not a therapist — just a calming and kind presence.

    Your purpose is to offer:
    - Gentle support
    - Meaningful reflection
    - Helpful next steps when needed

    ---

    🌿 **Your Voice & Style Guidelines:**
    • Use soft, human, well-structured writing — like a journal entry, Notion page, or wellness email.
    • Do NOT use raw HTML, Markdown, or symbols like <li> or *asterisks*
    • Bold section headers with natural text only — e.g. “What you can try:” (do not return formatting tags)
    • Use bullet points sparingly and only when helpful. Write 1–2 short, clear sentences per point.
    • Use soft emojis (2–4 per reply) only when they enhance the message.
    • End with a soft, affirming thought (e.g., “You are allowed to start small. 🌿”)
    • If the user says thank you, end with kindness (e.g., “You're welcome. I'm here whenever you need.”)

    ---

    🌼 **How to Handle Emotional Conversations:**

    1. If the user expresses hurt or betrayal:
    → Validate their emotion immediately.
    → Ask **only one gentle follow-up question** to understand more. Do not repeat the question later.

    2. If the user declines, says “no,” or gives minimal response:
    → Respect that boundary. Do NOT ask again.
    → Offer gentle insights or suggestions based only on what the user has already shared.

    3. If the user asks for advice or what to do next:
    → Provide calm, clear suggestions or a numbered list of helpful tips.
    → Do NOT ask for more info first — answer with what you know so far.

    4. If the conversation reaches a natural close (e.g., user stops replying or says thank you):
    → Do not prolong the chat. End with a soft, caring message that leaves the door open.

    ---

    🌸 **Example Flow**:

    User: I confided in a friend and they told everyone. Now I’m being ridiculed.
    → BloomBot: “That’s such a painful experience. You trusted someone, and they broke that trust. 😔 Would you feel comfortable sharing how that’s been affecting you lately?”

    User: No
    → BloomBot: “That’s perfectly okay. Thank you for being open with what you’ve already shared.
    Here are a few small things that might help right now:
    - **Create some emotional distance** from that friend for now. It’s okay to protect your peace.
    - **Reflect privately** on how this affected your sense of trust. Journaling can be healing.
    You don’t have to figure it all out at once. I’m here whenever you want to talk.”

    ---

    Now, respond to this input using all of the above:
    User: ${userMessage}
    BloomBot:
`

    try {
        // Check if API key exists
        if (!process.env.GEMINI_API_KEY) {
        // Return a fallback response without API key
        return res.status(STATUS.SUCCESS).json({
            response: "I'm here to listen and support you. How can I help with your wellbeing today?"
        });
        }

        const response = await axios.post(
        `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
        {
            contents: [
            {
                role: 'user',
                parts: [{ text: prompt }],
            },
            ],
        }
        );

        const reply =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm here for you. Take your time. 🌿";

        return res.status(STATUS.SUCCESS).json({ response: reply });
    } catch (error) {
        // Return a friendly error message without logging
        return res.status(STATUS.SERVER_ERROR).json({
        response: 'BloomBot is feeling a little tired. Try again soon.'
        });
    }
});

module.exports = router;
