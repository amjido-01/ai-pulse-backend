import Groq from "groq-sdk";


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const categorizeProduct = async (tagline: string): Promise<string> => {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an AI assistant acting as a professional text analyzer and you will be giving a tagline of an ai software. Your job is to analyze the following tagline: "${tagline}" and determine the most appropriate category the software belongs to based on the key word from the tagline. Respond with a single word that represents the category. Avoid generic responses like 'others'.`,
          },
        ],
        model: "llama-3.3-70b-versatile",
      });
  
      return response.choices[0]?.message?.content?.trim() || "uncategorized";
    } catch (error) {
      console.error("Error categorizing product tagline:", error);
      return "uncategorized"; // Default category if the API fails
    }
  }