import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  const apiUrl = process.env.GEMINI_API_URL;

  const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month"|"calculator-open" | "instagram-open" |"facebook-open" |"weather-show",
  "userInput": "<original user input>",
  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userinput": original sentence the user spoke.
- "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Important:
- Use ${userName} agar koi puche tume kisne banaya 
- Only respond with the JSON object, nothing else.

now your userInput- ${command}
`;

  let attempts = 0;
  const maxAttempts = 5; // max retries

  while (attempts < maxAttempts) {
    try {
      const result = await axios.post(apiUrl, {
        contents: [{ parts: [{ text: prompt }] }],
      });

      return result.data.candidates[0].content.parts[0].text;
    } catch (error) {
      // handle rate limit error
      if (error.response?.status === 429) {
        attempts++;
        const waitTime = 1000 * 2 ** attempts; // exponential backoff
        console.log(`Rate limit hit. Retrying in ${waitTime / 1000}s... (Attempt ${attempts})`);
        await new Promise((res) => setTimeout(res, waitTime));
      } else {
        console.error("Gemini API Error:", error.message);
        throw error; // rethrow other errors
      }
    }
  }

  throw new Error("Max retries reached due to rate limiting.");
};

export default geminiResponse;
