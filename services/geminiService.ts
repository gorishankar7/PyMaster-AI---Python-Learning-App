import { GoogleGenAI, Type } from "@google/genai";
import { Challenge, EvaluationResult, Difficulty, Language } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-pro-preview for complex coding tasks as per guidelines
const modelName = "gemini-3-pro-preview";

// Schema for generating challenges
const challengeSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      starterCode: { type: Type.STRING },
      points: { type: Type.INTEGER },
      testCases: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      timeLimit: { type: Type.INTEGER }
    },
    required: ["id", "title", "description", "starterCode", "points", "testCases", "timeLimit"],
  }
};

// Schema for evaluation
const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    correct: { type: Type.BOOLEAN },
    output: { type: Type.STRING },
    feedback: { type: Type.STRING },
    pointsAwarded: { type: Type.INTEGER }
  },
  required: ["correct", "output", "feedback", "pointsAwarded"]
};

export const generateSyllabus = async (difficulty: Difficulty, language: Language): Promise<Challenge[]> => {
  const languageInstruction = language === 'Hindi' 
    ? "The descriptions and titles should be in Hindi, but keep technical terms (like function names, class names, syntax) in English/Python." 
    : "The content should be in English.";

  const prompt = `
    Generate a syllabus of 5 Python coding challenges for a ${difficulty} level student.
    ${languageInstruction}
    
    Level Guidance:
    - Beginner: Variables, Loops, Basic Functions.
    - Intermediate: Lists, Dictionaries, String Manipulation, Basic Classes.
    - Advanced: Complex Algorithms, OOP, Recursion, Error Handling.

    Each challenge should have:
    - A unique ID.
    - A clear description of the task.
    - Starter code (def function_name(): pass).
    - Points (100-300 based on difficulty).
    - 3-5 descriptive test cases (e.g., "Input: 5 -> Output: 25").
    - A reasonable time limit in seconds (60-300).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: challengeSchema,
        temperature: 0.7,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Challenge[];
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error generating syllabus:", error);
    // Fallback or re-throw
    throw error;
  }
};

export const evaluateCode = async (
  challenge: Challenge, 
  userCode: string, 
  language: Language
): Promise<EvaluationResult> => {
  const prompt = `
    Act as a Python code judge.
    
    Challenge: ${challenge.title}
    Description: ${challenge.description}
    User Code:
    \`\`\`python
    ${userCode}
    \`\`\`
    
    Task:
    1. Check if the code runs without syntax errors.
    2. Check if it solves the problem described.
    3. Run strictly against hidden logical test cases based on the description.
    4. Return the simulated output of the code.
    
    If Correct: Award ${challenge.points} points.
    If Incorrect: Award 0 points.
    
    Feedback Language: ${language}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: evaluationSchema,
        temperature: 0.2, // Lower temperature for more deterministic grading
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as EvaluationResult;
    }
    throw new Error("Empty response from evaluation");
  } catch (error) {
    console.error("Evaluation error:", error);
    return {
      correct: false,
      output: "System Error: Could not evaluate code.",
      feedback: "Please try again.",
      pointsAwarded: 0
    };
  }
};

export const getHint = async (challenge: Challenge, userCode: string, language: Language): Promise<string> => {
    const prompt = `
        The user is stuck on this Python challenge: "${challenge.description}".
        User's current code:
        ${userCode}

        Provide a short, helpful hint in ${language}. 
        Do not give the full solution. 
        Focus on the logic or syntax error.
    `;

    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
    });
    return response.text || "No hint available.";
};