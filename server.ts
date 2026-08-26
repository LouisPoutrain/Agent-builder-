import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY;
    res.json({ status: "ok", hasApiKey: hasKey });
  });

  // Execute Agent Task
  app.post("/api/agent/run", async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(400).json({
          error: "Clé API Gemini non configurée dans l'environnement. Configurez GEMINI_API_KEY dans les secrets.",
        });
      }

      const {
        systemInstruction,
        prompt,
        model = "gemini-3.7-flash",
        temperature = 0.7,
        topP = 0.95,
        thinkingLevel,
        enableSearch = false,
        jsonResponse = false,
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Le prompt ou les données d'entrée sont requis." });
      }

      const config: any = {
        systemInstruction: systemInstruction || "Tu es un agent IA spécialisé et performant.",
        temperature: Number(temperature) || 0.7,
        topP: Number(topP) || 0.95,
      };

      if (thinkingLevel && (thinkingLevel === 'LOW' || thinkingLevel === 'HIGH' || thinkingLevel === 'MINIMAL')) {
        config.thinkingConfig = {
          thinkingLevel: thinkingLevel === 'LOW' ? ThinkingLevel.LOW : thinkingLevel === 'HIGH' ? ThinkingLevel.HIGH : ThinkingLevel.MINIMAL,
        };
      }

      if (enableSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      if (jsonResponse) {
        config.responseMimeType = "application/json";
      }

      const startTime = Date.now();
      const response = await ai.models.generateContent({
        model: model || "gemini-3.7-flash",
        contents: prompt,
        config: config,
      });
      const durationMs = Date.now() - startTime;

      const outputText = response.text || "";
      const usage = response.usageMetadata || null;

      // Extract search grounding metadata if available
      let groundingSources: any[] = [];
      const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (searchChunks && Array.isArray(searchChunks)) {
        groundingSources = searchChunks
          .map((chunk: any) => chunk.web)
          .filter(Boolean);
      }

      res.json({
        success: true,
        output: outputText,
        durationMs,
        usage,
        groundingSources,
      });
    } catch (err: any) {
      console.error("Error running agent:", err);
      res.status(500).json({
        error: err.message || "Erreur lors de l'exécution de l'agent Gemini.",
      });
    }
  });

  // Chat with Agent (multi-turn conversation)
  app.post("/api/agent/chat", async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(400).json({
          error: "Clé API Gemini non configurée dans l'environnement.",
        });
      }

      const {
        systemInstruction,
        messages, // [{ role: 'user' | 'model', content: string }]
        model = "gemini-3.7-flash",
        temperature = 0.7,
        enableSearch = false,
      } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Historique des messages invalide." });
      }

      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content || "" }],
      }));

      const config: any = {
        systemInstruction: systemInstruction || "Tu es un agent conversationnel pour Mac.",
        temperature: Number(temperature) || 0.7,
      };

      if (enableSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const startTime = Date.now();
      const response = await ai.models.generateContent({
        model: model || "gemini-3.7-flash",
        contents: formattedContents,
        config: config,
      });
      const durationMs = Date.now() - startTime;

      res.json({
        success: true,
        reply: response.text || "",
        durationMs,
        usage: response.usageMetadata,
      });
    } catch (err: any) {
      console.error("Error in agent chat:", err);
      res.status(500).json({
        error: err.message || "Erreur lors de la conversation avec l'agent.",
      });
    }
  });

  // Optimize Agent Prompt using Gemini
  app.post("/api/agent/optimize-prompt", async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(400).json({
          error: "Clé API Gemini non configurée dans l'environnement.",
        });
      }

      const { taskDescription, role, inputs = [] } = req.body;
      if (!taskDescription) {
        return res.status(400).json({ error: "La description de la tâche est requise." });
      }

      const metaPrompt = `Tu es le meilleur architecte de prompt IA et spécialiste de Google Gemini.
L'utilisateur veut créer un Agent IA dédié pour son Mac exécutant une tâche spécifique.

Détails fournis :
- Nom/Rôle de l'agent : ${role || "Non spécifié"}
- Description de la tâche : "${taskDescription}"
- Variables d'entrée prévues : ${JSON.stringify(inputs)}

Génère une configuration professionnelle au format JSON strict avec les champs suivants :
1. "name": Un nom percutant et élégant pour l'agent (ex: "Synthétiseur de Réunions Mac", "Refactoriseur Swift & TS", "Générateur AppleScript")
2. "systemInstruction": Les instructions système complètes, ultra-précises, structurées avec directives claires, règles de validation, ton et format attendu.
3. "suggestedInputs": Liste d'objets [{ "id": "nom_variable", "label": "Libellé en français", "type": "text" | "textarea" | "select" | "code" | "file", "placeholder": "...", "description": "..." }]
4. "recommendedTemperature": Nombre entre 0.1 et 1.0
5. "recommendedModel": "gemini-3.7-flash"
6. "outputFormat": "markdown" | "code" | "json" | "checklist"
7. "samplePromptTemplate": Un exemple de prompt utilisant les variables sous forme {{variable_id}}

Réponds STRICTEMENT avec du JSON valide sans markdown entourant si possible.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: metaPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      let jsonResult: any = {};
      try {
        const text = response.text?.trim() || "{}";
        jsonResult = JSON.parse(text);
      } catch {
        jsonResult = { systemInstruction: response.text };
      }

      res.json({
        success: true,
        optimized: jsonResult,
      });
    } catch (err: any) {
      console.error("Error optimizing prompt:", err);
      res.status(500).json({
        error: err.message || "Erreur lors de l'optimisation du prompt.",
      });
    }
  });

  // Batch runner
  app.post("/api/agent/batch-run", async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(400).json({ error: "Clé API Gemini non configurée." });
      }

      const { systemInstruction, items, model = "gemini-3.7-flash", temperature = 0.5 } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Liste d'éléments invalide pour le traitement par lot." });
      }

      // Process items (limit to max 5 items in parallel)
      const limitedItems = items.slice(0, 8);
      const results = await Promise.all(
        limitedItems.map(async (item: any, idx: number) => {
          const itemPrompt = typeof item === 'string' ? item : item.prompt || JSON.stringify(item);
          try {
            const start = Date.now();
            const resp = await ai.models.generateContent({
              model,
              contents: itemPrompt,
              config: {
                systemInstruction: systemInstruction || "Tu es un agent d'automatisation de tâches.",
                temperature: Number(temperature) || 0.5,
              },
            });
            return {
              id: item.id || `item-${idx + 1}`,
              input: itemPrompt,
              output: resp.text || "",
              success: true,
              durationMs: Date.now() - start,
            };
          } catch (itemErr: any) {
            return {
              id: item.id || `item-${idx + 1}`,
              input: itemPrompt,
              output: "",
              success: false,
              error: itemErr.message,
            };
          }
        })
      );

      res.json({ success: true, results });
    } catch (err: any) {
      console.error("Error in batch run:", err);
      res.status(500).json({ error: err.message || "Erreur lors du batch run." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MacAgent Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
