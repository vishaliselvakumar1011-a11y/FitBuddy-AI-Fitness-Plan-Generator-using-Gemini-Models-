import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory & file-backed database storage for Users, Plans, Feedback & Analytics
interface DbUserRecord {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  unitSystem: string;
  primaryGoal: string;
  experienceLevel: string;
  createdAt: string;
  planCount: number;
  lastActive: string;
}

interface DbPlanRecord {
  id: string;
  userId: string;
  userName: string;
  planName: string;
  tagline: string;
  modelUsed: string;
  createdAt: string;
  daysPerWeek: number;
  targetCalories: number;
  originalPlan?: any;
  fullPlan: any;
  feedbackHistory: Array<{
    id: string;
    timestamp: string;
    userFeedback: string;
    appliedChangesSummary?: string;
  }>;
}

const DB_FILE = path.join(__dirname, 'fitbuddy-db.json');

const loadDb = (): { users: Record<string, DbUserRecord>; plans: DbPlanRecord[] } => {
  try {
    const fs = (globalThis as any).fs || null;
    // using Node's fs dynamically to keep clean
    const nodeFs = require('fs');
    if (nodeFs.existsSync(DB_FILE)) {
      const data = nodeFs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    // fallback or continue
  }
  return { users: {}, plans: [] };
};

const saveDb = (db: { users: Record<string, DbUserRecord>; plans: DbPlanRecord[] }) => {
  try {
    const nodeFs = require('fs');
    nodeFs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write fitbuddy-db.json:', err);
  }
};

let dbCache = loadDb();

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Generate Fitness Plan
app.post('/api/generate-plan', async (req, res) => {
  try {
    const profile = req.body;
    const modelToUse = profile.geminiModel === 'gemini-3.1-flash-lite' 
      ? 'gemini-3.1-flash-lite' 
      : 'gemini-3.8-flash';

    const ai = getGeminiClient();

    const prompt = `
You are FitBuddy, an elite personal trainer, CSCS (Certified Strength & Conditioning Specialist), and sports nutritionist.
Create an in-depth, realistic, science-backed, and personalized 7-day fitness, workout, nutrition, and lifestyle blueprint for this client.

Client Profile:
- Name: ${profile.name || 'Athlete'}
- Age: ${profile.age || 28}, Gender: ${profile.gender || 'unspecified'}
- Weight: ${profile.weight || 70} ${profile.unitSystem === 'imperial' ? 'lbs' : 'kg'}
- Height: ${profile.height || 175} ${profile.unitSystem === 'imperial' ? 'in' : 'cm'}
- Primary Goal: ${profile.primaryGoal}
- Secondary Goals: ${(profile.secondaryGoals || []).join(', ') || 'General health'}
- Experience Level: ${profile.experienceLevel}
- Schedule: ${profile.daysPerWeek || 4} workout days per week
- Session Duration: ${profile.sessionDuration || 45} minutes per session
- Workout Venue & Equipment: Location: ${profile.workoutLocation}, Available: ${(profile.equipmentAvailable || []).join(', ') || 'Standard equipment'}
- Preferred Activities: ${(profile.preferredActivities || []).join(', ') || 'Strength & Conditioning'}
- Target Muscle Focus: ${(profile.targetMuscles || []).join(', ') || 'Full body balanced'}
- Physical Limitations / Injuries: ${profile.physicalLimitations || 'None noted'}
- Dietary Preference: ${profile.dietaryStyle || 'omnivore'}, Calorie strategy: ${profile.calorieGoalType || 'deficit'}
- Sleep: ${profile.sleepHours || 7} hours/night, Daily Stress Level: ${profile.dailyStressLevel || 'moderate'}
- Daily Step Target: ${profile.dailyStepTarget || 8000} steps

Generate a complete 7-day schedule (Day 1 through Day 7). Exactly ${profile.daysPerWeek || 4} days should be workout days with detailed exercises, and the remaining ${7 - (profile.daysPerWeek || 4)} days should be rest or active recovery days.
Ensure every exercise has realistic reps, sets, rest seconds, key form cues, and an alternative exercise suitable for their equipment/injuries.

Return ONLY a valid JSON object matching the following structure without any extra markdown ticks or enclosing code blocks:
{
  "id": "fitbuddy-plan-${Date.now()}",
  "createdAt": "${new Date().toISOString()}",
  "modelUsed": "${modelToUse}",
  "planName": "Engaging, motivational plan title",
  "tagline": "Inspiring one-sentence summary",
  "overview": "Clear 2-3 paragraph breakdown explaining the science and methodology of this personalized program",
  "weeklySplitSummary": "Quick summary of the split (e.g. Upper/Lower/Push/Pull/Rest)",
  "schedule": [
    {
      "dayNumber": 1,
      "dayName": "Day 1 - Monday",
      "title": "Workout Title or Active Recovery",
      "isRestDay": false,
      "focus": "Target muscle groups or focus",
      "durationMinutes": 45,
      "estimatedCaloriesBurn": 320,
      "warmup": {
        "durationMinutes": 5,
        "routine": ["Arm circles 30s", "Cat-cow 1m", "Bodyweight squats x 12"]
      },
      "exercises": [
        {
          "id": "ex-1-1",
          "name": "Exercise Name",
          "targetMuscles": ["Chest", "Triceps"],
          "sets": 3,
          "reps": "8-12 reps",
          "restSeconds": 60,
          "rpe": "RPE 7-8",
          "tempo": "2-0-1-0",
          "formCues": ["Cue 1", "Cue 2"],
          "alternativeExercise": "Easier or alternative movement",
          "equipment": "Dumbbells"
        }
      ],
      "cooldown": {
        "durationMinutes": 5,
        "routine": ["Chest stretch 45s", "Childs pose 1m"]
      },
      "recoveryTips": "Hydrate and foam roll"
    }
  ],
  "nutrition": {
    "dailyCalorieTarget": 2200,
    "macros": {
      "proteinGrams": 150,
      "carbsGrams": 220,
      "fatsGrams": 65,
      "proteinPercent": 30,
      "carbsPercent": 45,
      "fatsPercent": 25
    },
    "hydrationLiters": 3.0,
    "supplementationTips": ["Whey or plant protein", "Creatine monohydrate 5g", "Omega-3", "Vitamin D3"],
    "mealSuggestions": [
      {
        "mealType": "Breakfast",
        "title": "Power Protein Oats & Berries",
        "description": "Rolled oats cooked with chia seeds, topped with whey/plant protein powder, fresh blueberries, and crushed almonds.",
        "estimatedCalories": 480,
        "proteinGrams": 35,
        "carbsGrams": 55,
        "fatsGrams": 12,
        "keyIngredients": ["Oats", "Protein Powder", "Blueberries", "Almonds"]
      },
      {
        "mealType": "Lunch",
        "title": "Mediterranean Quinoa Bowl",
        "description": "Grilled chicken breast or seasoned tofu with mixed greens, quinoa, cucumbers, kalamata olives, and lemon tahini dressing.",
        "estimatedCalories": 620,
        "proteinGrams": 45,
        "carbsGrams": 50,
        "fatsGrams": 18,
        "keyIngredients": ["Chicken/Tofu", "Quinoa", "Greens", "Tahini"]
      },
      {
        "mealType": "Dinner",
        "title": "Lean Salmon / Tempeh with Roasted Veggies & Sweet Potato",
        "description": "Baked wild salmon or marinated tempeh served alongside roasted broccoli, asparagus, and baked sweet potato wedges.",
        "estimatedCalories": 650,
        "proteinGrams": 42,
        "carbsGrams": 60,
        "fatsGrams": 20,
        "keyIngredients": ["Salmon/Tempeh", "Sweet Potato", "Broccoli", "Olive Oil"]
      },
      {
        "mealType": "Snack",
        "title": "Greek Yogurt & Walnut Crunch",
        "description": "Low-fat Greek yogurt with raw honey drizzle and crushed walnuts for sustained amino acids.",
        "estimatedCalories": 250,
        "proteinGrams": 20,
        "carbsGrams": 15,
        "fatsGrams": 9,
        "keyIngredients": ["Greek Yogurt", "Walnuts", "Honey"]
      }
    ],
    "dietaryGuidance": [
      "Prioritize 1.6 - 2.2g of protein per kg of body weight to support recovery.",
      "Consume the bulk of complex carbohydrates around your workout window."
    ]
  },
  "lifestyle": {
    "sleepRecommendations": [
      "Target 7-9 hours of consistent sleep with a cool, dark room.",
      "Cut caffeine intake 8 hours prior to bedtime."
    ],
    "stressManagement": [
      "10 minutes of box breathing (4s in, 4s hold, 4s out, 4s hold) post-workout or before bed.",
      "Take a 15-minute screen-free walk outdoors daily."
    ],
    "dailyHabits": [
      "Drink 500ml water immediately upon waking.",
      "Hit the daily step target of ${profile.dailyStepTarget || 8000} steps.",
      "Log completed workouts and note weights lifted."
    ],
    "weeklyMilestones": [
      "Week 1: Establish consistent workout adherence and baseline weights.",
      "Week 2: Aim for progressive overload by adding 1 rep or +2.5% weight to compound lifts."
    ],
    "coachMessage": "Personal encouraging message from FitBuddy addressing their specific goal and journey."
  }
}
`;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: {
        systemInstruction: "You are FitBuddy, an expert certified personal trainer and sports nutritionist. You produce realistic, safe, and science-grounded workout plans formatted strictly in valid JSON.",
        responseMimeType: "application/json",
      },
    });

    const text = response.text || '';
    // Clean any accidental markdown wrap
    const cleanedText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsedData = JSON.parse(cleanedText);

    // Save to Database
    const userName = profile.name?.trim() || 'Athlete';
    const userId = userName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'user-default';
    const nowIso = new Date().toISOString();

    const existingUser = dbCache.users[userId];
    dbCache.users[userId] = {
      id: userId,
      name: userName,
      age: Number(profile.age) || 28,
      weight: Number(profile.weight) || 70,
      height: Number(profile.height) || 175,
      unitSystem: profile.unitSystem || 'metric',
      primaryGoal: profile.primaryGoal || 'general_fitness',
      experienceLevel: profile.experienceLevel || 'intermediate',
      createdAt: existingUser?.createdAt || nowIso,
      planCount: (existingUser?.planCount || 0) + 1,
      lastActive: nowIso,
    };

    const newDbPlan: DbPlanRecord = {
      id: parsedData.id || `fitbuddy-plan-${Date.now()}`,
      userId,
      userName,
      planName: parsedData.planName || 'Personalized Fitness Plan',
      tagline: parsedData.tagline || '',
      modelUsed: modelToUse,
      createdAt: nowIso,
      daysPerWeek: profile.daysPerWeek || 4,
      targetCalories: parsedData.nutrition?.dailyCalorieTarget || 2200,
      originalPlan: JSON.parse(JSON.stringify(parsedData)),
      fullPlan: parsedData,
      feedbackHistory: [],
    };

    dbCache.plans.unshift(newDbPlan);
    saveDb(dbCache);

    res.json({ success: true, plan: parsedData, dbPlanId: newDbPlan.id, userId });
  } catch (error: any) {
    console.error('Error generating fitness plan:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate fitness plan with Gemini.',
    });
  }
});

// API: Modify existing plan based on user feedback
app.post('/api/modify-plan', async (req, res) => {
  try {
    const { currentPlan, modificationPrompt, model, userId } = req.body;
    const modelToUse = model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';
    const ai = getGeminiClient();

    const prompt = `
You are FitBuddy, the AI Fitness Coach.
The user wants to update or modify their current fitness plan based on their direct feedback.
Current Plan:
${JSON.stringify(currentPlan, null, 2)}

User's Feedback / Modification Request:
"${modificationPrompt}"

Apply the user's modifications precisely while keeping the entire plan coherent, balanced, and safe.
For example, if they request to replace squats because of knee discomfort, substitute safe quad/hamstring alternatives like glute bridges or leg extensions.
If they request to change duration, adjust exercises accordingly.
Ensure you return the FULL updated plan as a valid JSON object matching the original structure.
Do not wrap in markdown quotes.
`;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: {
        systemInstruction: "You are FitBuddy. Return ONLY the modified fitness plan object as valid JSON.",
        responseMimeType: "application/json",
      },
    });

    const text = response.text || '';
    const cleanedText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const updatedPlan = JSON.parse(cleanedText);

    // Record feedback and update plan in database
    const nowIso = new Date().toISOString();
    const planIndex = dbCache.plans.findIndex(p => p.id === currentPlan.id || p.fullPlan?.id === currentPlan.id);
    if (planIndex >= 0) {
      if (!dbCache.plans[planIndex].originalPlan) {
        dbCache.plans[planIndex].originalPlan = JSON.parse(JSON.stringify(dbCache.plans[planIndex].fullPlan || currentPlan));
      }
      dbCache.plans[planIndex].fullPlan = updatedPlan;
      dbCache.plans[planIndex].planName = updatedPlan.planName || dbCache.plans[planIndex].planName;
      dbCache.plans[planIndex].feedbackHistory.push({
        id: `fb-${Date.now()}`,
        timestamp: nowIso,
        userFeedback: modificationPrompt,
        appliedChangesSummary: 'Plan updated with Gemini based on user feedback.',
      });
      saveDb(dbCache);
    } else {
      // Create new record for modified plan if not found
      dbCache.plans.unshift({
        id: updatedPlan.id || `fitbuddy-plan-${Date.now()}`,
        userId: userId || 'user-default',
        userName: currentPlan.planName?.split(' ')[0] || 'Athlete',
        planName: updatedPlan.planName || 'Updated Plan',
        tagline: updatedPlan.tagline || '',
        modelUsed: modelToUse,
        createdAt: nowIso,
        daysPerWeek: updatedPlan.schedule?.filter((d: any) => !d.isRestDay).length || 4,
        targetCalories: updatedPlan.nutrition?.dailyCalorieTarget || 2200,
        originalPlan: JSON.parse(JSON.stringify(currentPlan)),
        fullPlan: updatedPlan,
        feedbackHistory: [
          {
            id: `fb-${Date.now()}`,
            timestamp: nowIso,
            userFeedback: modificationPrompt,
            appliedChangesSummary: 'Plan updated with Gemini based on user feedback.',
          },
        ],
      });
      saveDb(dbCache);
    }

    res.json({ success: true, plan: updatedPlan });
  } catch (error: any) {
    console.error('Error modifying plan:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to modify fitness plan.',
    });
  }
});

// API: FitBuddy Coach Chat (Ask any fitness question, form tips, motivation)
app.post('/api/coach-chat', async (req, res) => {
  try {
    const { messages, currentPlanSummary, userProfile } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `
You are FitBuddy, a warm, motivating, science-grounded personal trainer and nutritionist.
You assist the user with advice on exercise form, recovery, nutrition, workout swaps, and mindset.
Client context:
- Name: ${userProfile?.name || 'Athlete'}
- Goal: ${userProfile?.primaryGoal || 'fitness'}
- Plan Summary: ${currentPlanSummary || 'Active personalized routine'}

Keep your responses conversational, supportive, actionable, and formatted nicely with markdown bullet points or bold text when explaining exercises or meal ideas. Avoid overly medical diagnoses; prioritize safe training mechanics.
`;

    const lastMessage = messages[messages.length - 1];
    const previousConversation = messages.slice(0, -1).map((m: any) => `${m.role === 'user' ? 'User' : 'FitBuddy'}: ${m.content}`).join('\n');

    const prompt = previousConversation 
      ? `Previous discussion:\n${previousConversation}\n\nUser: ${lastMessage.content}` 
      : lastMessage.content;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error('Error in coach chat:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to communicate with FitBuddy Coach.',
    });
  }
});

// API: Audio Voice Briefing using Gemini TTS
app.post('/api/voice-briefing', async (req, res) => {
  try {
    const { text, voiceName } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text prompt is required for briefing.' });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 500), // Keep concise and energetic
              speechMetadata: {
                style: 'Energetic, motivational personal trainer giving an encouraging daily workout brief',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            prebuiltVoiceConfig: { voiceName: voiceName || 'Fenrir' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ success: false, error: 'No audio returned from Gemini TTS.' });
    }

    res.json({
      success: true,
      audio: base64Audio,
      mimeType: response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/mp3',
    });
  } catch (error: any) {
    console.error('Error generating voice briefing:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate voice briefing.',
    });
  }
});

// ================= ADMIN DASHBOARD API ROUTES =================
// GET /api/admin/overview - statistics on users, plans, and feedback
app.get('/api/admin/overview', (_req, res) => {
  const usersList = Object.values(dbCache.users);
  const totalUsers = usersList.length;
  const totalPlans = dbCache.plans.length;
  const totalFeedbackCount = dbCache.plans.reduce((acc, p) => acc + (p.feedbackHistory?.length || 0), 0);

  // Goal breakdown
  const goalsMap: Record<string, number> = {};
  usersList.forEach(u => {
    goalsMap[u.primaryGoal] = (goalsMap[u.primaryGoal] || 0) + 1;
  });

  // Recent plans with brief metadata
  const recentPlans = dbCache.plans.slice(0, 10).map(p => ({
    id: p.id,
    userId: p.userId,
    userName: p.userName,
    planName: p.planName,
    modelUsed: p.modelUsed,
    createdAt: p.createdAt,
    daysPerWeek: p.daysPerWeek,
    targetCalories: p.targetCalories,
    feedbackCount: p.feedbackHistory?.length || 0,
  }));

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalPlans,
      totalFeedbackCount,
      goalsBreakdown: goalsMap,
    },
    users: usersList.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()),
    recentPlans,
  });
});

// GET /api/admin/plans/:id - full plan inspection
app.get('/api/admin/plans/:id', (req, res) => {
  const plan = dbCache.plans.find(p => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, error: 'Plan not found.' });
  }
  res.json({ success: true, plan });
});

// DELETE /api/admin/plans/:id - remove plan
app.delete('/api/admin/plans/:id', (req, res) => {
  dbCache.plans = dbCache.plans.filter(p => p.id !== req.params.id);
  saveDb(dbCache);
  res.json({ success: true, message: 'Plan removed.' });
});

// POST /api/flash-tip - Quick Nutrition & Recovery Tips using Gemini Flash
app.post('/api/flash-tip', async (req, res) => {
  try {
    const { category, goal, dietStyle } = req.body;
    const ai = getGeminiClient();

    const prompt = `
You are FitBuddy's rapid-response sports nutritionist and recovery scientist powered by Gemini Flash.
Provide a high-impact, practical, evidence-grounded nutrition or recovery tip for:
Category: ${category || 'post-workout'}
User Goal: ${goal || 'muscle_gain / fat_loss'}
Dietary Style: ${dietStyle || 'high_protein'}

Format the response as JSON:
{
  "title": "Punchy 3-5 word headline",
  "category": "${category || 'post-workout'}",
  "keyAdvice": "2-3 clear, actionable sentences explaining what to eat or do right now",
  "timing": "e.g. Within 45 minutes of training",
  "macroFocus": "e.g. 25-35g Leucine-rich protein + 40g rapid carbs",
  "proTip": "One concise science-backed takeaway"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: "You are FitBuddy. Return valid JSON only.",
        responseMimeType: "application/json",
      },
    });

    const text = response.text || '';
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    res.json({ success: true, tip: parsed });
  } catch (error: any) {
    console.error('Error generating flash tip:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate flash tip' });
  }
});

// GET /api/openapi.json - OpenAPI 3.0 specification for FastAPI-style /docs
app.get('/api/openapi.json', (_req, res) => {
  res.json({
    openapi: "3.0.2",
    info: {
      title: "FitBuddy – AI Fitness & Nutrition Engine API",
      description: "FastAPI-style REST API powering FitBuddy 7-Day Workout Plans, Gemini Models, Nutrition Engine, and Admin Database Monitoring.",
      version: "1.2.0"
    },
    paths: {
      "/api/generate-plan": {
        post: {
          summary: "Generate 7-Day Workout & Nutrition Plan",
          description: "Generates a complete personalized fitness, nutrition, and recovery blueprint using Gemini 1.5 Pro / Gemini 3.8 Flash based on user details.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Alex" },
                    age: { type: "integer", example: 29 },
                    weight: { type: "number", example: 72 },
                    height: { type: "number", example: 176 },
                    unitSystem: { type: "string", enum: ["metric", "imperial"], example: "metric" },
                    primaryGoal: { type: "string", example: "muscle_gain" },
                    experienceLevel: { type: "string", example: "intermediate" },
                    daysPerWeek: { type: "integer", example: 4 },
                    sessionDuration: { type: "integer", example: 45 },
                    workoutLocation: { type: "string", example: "home_minimal" },
                    dietaryStyle: { type: "string", example: "high_protein" },
                    geminiModel: { type: "string", example: "gemini-3.8-flash" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Successful 7-day plan generation and database storage." }
          }
        }
      },
      "/api/modify-plan": {
        post: {
          summary: "Update Plan via User Feedback",
          description: "Applies user feedback (e.g. 'Add more cardio', 'Include more rest days') to adjust existing plan with full version history tracking in SQLite/JSON database.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    currentPlan: { type: "object" },
                    modificationPrompt: { type: "string", example: "Add more cardio on Day 2 and make leg exercises joint-friendly" },
                    model: { type: "string", example: "gemini-3.8-flash" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Updated plan with feedback iteration logged." }
          }
        }
      },
      "/api/flash-tip": {
        post: {
          summary: "Quick Nutrition & Recovery Tip",
          description: "Rapid Gemini Flash tip for instant pre/post-workout fueling, hydration, and muscle recovery.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    category: { type: "string", example: "pre-workout" },
                    goal: { type: "string", example: "fat_loss" },
                    dietStyle: { type: "string", example: "high_protein" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Instant actionable flash tip." }
          }
        }
      },
      "/api/coach-chat": {
        post: {
          summary: "AI Fitness Coach Assistant",
          description: "Conversational fitness advice on biomechanics, form cues, injury substitutions, and workout motivation.",
          responses: {
            "200": { description: "Coach reply with actionable guidance." }
          }
        }
      },
      "/api/voice-briefing": {
        post: {
          summary: "Voice Audio Briefing (Gemini TTS)",
          description: "Generates spoken audio briefing with customizable voice personas (Fenrir, Puck, Kore, Zephyr).",
          responses: {
            "200": { description: "Base64 audio stream of coach briefing." }
          }
        }
      },
      "/api/admin/overview": {
        get: {
          summary: "Admin Overview & Telemetry",
          description: "Returns statistics on registered users, all stored workout plans, and feedback iterations.",
          responses: {
            "200": { description: "Aggregated platform metrics and plan lists." }
          }
        }
      }
    }
  });
});

// Vite & Static file setup
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy server listening on http://0.0.0.0:${PORT}`);
  });
};

startServer();
