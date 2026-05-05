import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const SYSTEM_PROMPT = `Tu es un coach stratégique brutalement honnête, rationnel et orienté performance.
Tu analyses les données réelles de l'utilisateur (trading, argent, e-commerce, habitudes).
Tu identifies les erreurs, les patterns négatifs, et les actions à fort levier.
Tu ne donnes pas de motivation vide. Tu es précis, direct, concis.
Tu réponds toujours en français. Max 300 mots sauf si demande explicite de plus.
L'utilisateur s'appelle Benjamin. Son objectif : atteindre $68,000 USD d'ici mars 2028.`;

const MODE_PROMPTS: Record<string, string> = {
  brief: `Génère un Daily Brief COURT (max 200 mots) avec :
**PRIORITÉ #1** du jour (une seule action concrète)
**RISQUE PRINCIPAL** à surveiller
**ACTION TRADING** du jour
**ACTION BUSINESS** du jour
**PHRASE DE DISCIPLINE** (directe, pas de motivation vide)`,

  audit: `Fais un audit BRUTAL et HONNÊTE de la situation actuelle.
Dis exactement où l'utilisateur en est, ce qui bloque, et l'action #1 immédiate.
Pas de compliments inutiles. Sois comme un mentor qui veut vraiment les résultats.`,

  trading: `Analyse le journal de trading en détail :
**3 FORCES** du trading actuel
**3 FAIBLESSES CRITIQUES** (avec données)
**ERREUR LA PLUS COÛTEUSE** (coût estimé)
**SETUP LE PLUS RENTABLE** à développer
**RÈGLE À AJOUTER AU PLAN** dès maintenant
**PLAN 7 JOURS** : 3 actions concrètes et mesurables`,

  ecom: `Analyse le portfolio e-commerce :
**SITUATION** en 2 phrases
**PRODUIT À KILLER** (si applicable) + pourquoi
**PRODUIT À SCALER** (si applicable) + comment
**BOTTLENECK PRINCIPAL** du business
**3 ACTIONS** pour les 30 prochains jours
**VERDICT** : continuer ou pivoter ?`,

  money: `Analyse la trajectoire financière vers $68k :
**RÉALISME** : atteignable au rythme actuel ? (sois direct)
**FUITE D'ARGENT** principale à corriger
**ÉPARGNE MENSUELLE REQUISE** pour atteindre l'objectif
**ALLOCATION RECOMMANDÉE** en %
**3 ACTIONS MONEY** pour ce mois
**VERDICT** : avance ou retard ?`,

  weekly: `Génère une Weekly Review basée sur les données :
**RÉSUMÉ BRUTAL** de la semaine (3 phrases)
**3 ERREURS** principales
**3 WINS** réels
**CE QUI A FONCTIONNÉ** et pourquoi reproduire
**CE QUI A ÉCHOUÉ** et cause racine
**PLAN SEMAINE SUIVANTE** : 3 priorités non négociables
**ACTION #1** à ne pas rater (une seule)
**SCORE ESTIMÉ** /10 avec justification`,

  decision: `Analyse la qualité de la décision :
**BIAIS DÉTECTÉS** (sunk cost, FOMO, peur, surconfiance...)
**QUALITÉ DU RAISONNEMENT** /10 avec justification
**CE QUI AURAIT DÛ ÊTRE CONSIDÉRÉ**
**LEÇON PRINCIPALE**
**FRAMEWORK** à appliquer pour la prochaine fois`,

  roadmap: `Analyse la roadmap vers $68k Mars 2028 :
**AVANCE OU RETARD** : calcul précis
**PHASE QUI BLOQUE** le plus en ce moment
**LEVIER PRIORITAIRE** à activer maintenant
**RISQUE PRINCIPAL** sur la roadmap
**RECOMMANDATION BRUTALE** : que faire la semaine prochaine`,
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY missing" },
        { status: 500 }
      );
    }

    const { prompt, mode, context } = await request.json();

    if (!prompt && !mode) {
      return NextResponse.json(
        { error: "prompt or mode required" },
        { status: 400 }
      );
    }

    const modeInstructions = mode ? MODE_PROMPTS[mode] || "" : "";

    const contextStr = context
      ? `\n\n=== DONNÉES UTILISATEUR ===\n${JSON.stringify(
          context,
          null,
          2
        )}\n=== FIN DONNÉES ===\n\n`
      : "";

    const fullPrompt =
      contextStr +
      (modeInstructions ? `${modeInstructions}\n\n` : "") +
      (prompt || "Analyse la situation globale.");

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions: SYSTEM_PROMPT,
      input: fullPrompt,
      max_output_tokens: 1500,
    });

    const responseText = response.output_text || "";

    supabase
      .from("ai_logs")
      .insert({
        user_id: user.id,
        module: mode || "custom",
        mode,
        prompt_preview: (prompt || fullPrompt).slice(0, 200),
        response_preview: responseText.slice(0, 200),
        tokens_used: response.usage
          ? response.usage.input_tokens + response.usage.output_tokens
          : null,
      })
      .then(() => {});

    return NextResponse.json({ text: responseText });
  } catch (error: unknown) {
    console.error("AI route error:", error);

    const message =
      error instanceof Error ? error.message : "AI service error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
