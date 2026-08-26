import { AgentDefinition } from '../types';

export const DEFAULT_AGENTS: AgentDefinition[] = [
  {
    id: 'mac-applescript-bash',
    name: 'Mac Script & AppleScript Architect',
    description: 'Génère des commandes Terminal (zsh/bash), scripts AppleScript et raccourcis macOS sécurisés.',
    icon: '⚡',
    category: 'mac-automation',
    accentColor: 'from-amber-500 to-orange-600',
    isBuiltIn: true,
    model: 'gemini-3.7-flash',
    temperature: 0.2,
    thinkingLevel: 'LOW',
    outputFormat: 'code',
    systemInstruction: `Tu es un expert mondial en macOS, Unix (zsh/bash), AppleScript, JXA (JavaScript for Automation) et architecture macOS (Finder, launchd, defaults, plists, Homebrew, ffmpeg, imagemagick).
Ton rôle est de fournir des scripts propres, sécurisés, documentés et directement exécutables sur Mac.

Règles impératives :
1. Fournis le script sous un bloc de code approprié (zsh, bash, applescript).
2. Explique en 2-3 points clés ce que fait chaque commande.
3. Mets un avertissement clair si la commande touche aux fichiers système ou supprime des fichiers.
4. Indique si des dépendances comme Homebrew sont requises (ex: brew install ffmpeg).`,
    promptTemplate: `Tâche macOS demandée : {{task}}
Environnement / Outil cible : {{target_tool}}
Niveau de sécurité / Précautions : {{safety_level}}
Détails supplémentaires ou chemins : {{extra_details}}`,
    inputVariables: [
      {
        id: 'task',
        label: 'Tâche à automatiser sur Mac',
        type: 'textarea',
        placeholder: 'Ex: Convertir tous les fichiers .mov d\'un dossier en .mp4 optimisés, ou fermer toutes les fenêtres Finder et vider la corbeille sécurisée.',
        required: true,
      },
      {
        id: 'target_tool',
        label: 'Outil / Langage',
        type: 'select',
        options: ['Terminal (zsh / bash)', 'AppleScript', 'Raccourci macOS (Shortcuts)', 'JavaScript for Automation (JXA)', 'Automator'],
        defaultValue: 'Terminal (zsh / bash)',
      },
      {
        id: 'safety_level',
        label: 'Mode de précaution',
        type: 'select',
        options: ['Standard (avec confirmation)', 'Dry-run / Simulation préalable', 'Exécution directe'],
        defaultValue: 'Standard (avec confirmation)',
      },
      {
        id: 'extra_details',
        label: 'Détails / Dossiers cibles (optionnel)',
        type: 'text',
        placeholder: 'Ex: ~/Downloads/Projets ou /Volumes/ExternalSSD',
      }
    ],
    samplePresets: [
      {
        task: 'Renommer en masse tous les fichiers .jpg et .png d\'un dossier en y ajoutant la date du jour (YYYY-MM-DD_nom.ext)',
        target_tool: 'Terminal (zsh / bash)',
        safety_level: 'Standard (avec confirmation)',
        extra_details: 'Dossier ~/Downloads/Photos'
      },
      {
        task: 'Créer un AppleScript qui active le mode "Ne pas déranger", lance Spotify sur une playlist Focus et ouvre Notion en plein écran',
        target_tool: 'AppleScript',
        safety_level: 'Exécution directe',
        extra_details: 'Applications installées sur macOS Sequoia'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'email-slack-pro',
    name: 'Rédacteur Emails & Slack Executive',
    description: 'Transforme des notes brutes ou des idées en emails percutants et messages Slack adaptés au contexte.',
    icon: '✉️',
    category: 'writing',
    accentColor: 'from-blue-500 to-indigo-600',
    isBuiltIn: true,
    model: 'gemini-3.7-flash',
    temperature: 0.6,
    outputFormat: 'markdown',
    systemInstruction: `Tu es un conseiller exécutif en communication professionnelle bilingue (Français & Anglais).
Tu transformes des idées brouillonnes ou des notes rapides en communications professionnelles impeccables.

Directives :
- Rédige un objet percutant et clair si c'est un email.
- Adapte le registre exactement au ton demandé (formel, chaleureux, concis, persuasion commerciale, etc.).
- Structure avec des puces aérées pour une lecture rapide sur mobile/Mac.
- Propose 2 variantes si pertinent : une version concise (directe) et une version élaborée.`,
    promptTemplate: `Notes brutes / Idées principales :
{{raw_notes}}

Type de message : {{channel}}
Destinataire : {{recipient}}
Tonalité souhaitée : {{tone}}
Langue : {{language}}
Appel à l'action (CTA) spécifique : {{cta}}`,
    inputVariables: [
      {
        id: 'raw_notes',
        label: 'Notes brutes ou message à reformuler',
        type: 'textarea',
        placeholder: 'Ex: Je dois décaler la réunion client de demain 14h à jeudi 10h parce qu\'on attend les chiffres du Q3. M\'excuser pour le délai court.',
        required: true,
      },
      {
        id: 'channel',
        label: 'Canal de diffusion',
        type: 'select',
        options: ['Email professionnel', 'Message Slack / Teams', 'Message LinkedIn', 'Compte-rendu rapide'],
        defaultValue: 'Email professionnel',
      },
      {
        id: 'recipient',
        label: 'Destinataire',
        type: 'text',
        placeholder: 'Ex: Direction générale, Client VIP, Équipe tech, Prestataire',
        defaultValue: 'Client important',
      },
      {
        id: 'tone',
        label: 'Tonalité',
        type: 'select',
        options: ['Professionnel & Diplomate', 'Court & Efficace (Executive)', 'Chaleureux & Encourageant', 'Ferme & Constructif'],
        defaultValue: 'Professionnel & Diplomate',
      },
      {
        id: 'language',
        label: 'Langue',
        type: 'select',
        options: ['Français', 'Anglais (US/UK)', 'Bilingue FR + EN'],
        defaultValue: 'Français',
      },
      {
        id: 'cta',
        label: 'Appel à l\'action (optionnel)',
        type: 'text',
        placeholder: 'Ex: Confirmer votre disponibilité d\'ici ce soir 18h',
      }
    ],
    samplePresets: [
      {
        raw_notes: 'Projet retardé de 3 jours car API Stripe en maintenance. On livre vendredi sans surcoût. Demander validation du nouveau planning.',
        channel: 'Email professionnel',
        recipient: 'Client VIP',
        tone: 'Professionnel & Diplomate',
        language: 'Français',
        cta: 'Valider le planning révisé par retour de mail'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'code-refactor-mac',
    name: 'Refactoriseur de Code & Types',
    description: 'Optimise, type, commente et nettoie du code TypeScript, Swift, Python ou Rust.',
    icon: '💻',
    category: 'coding',
    accentColor: 'from-emerald-500 to-teal-700',
    isBuiltIn: true,
    model: 'gemini-3.7-flash',
    temperature: 0.2,
    thinkingLevel: 'LOW',
    outputFormat: 'code',
    systemInstruction: `Tu es un ingénieur logiciel Senior (Staff Engineer) expert en clean code, performance, typage strict et design patterns.
Ton objectif est d'analyser le code fourni, de le refactoriser et de fournir la version corrigée avec explications des gains obtenus.

Directives :
1. Fournis le code refactorisé complet, prêt pour un copier-coller.
2. Ajoute des types TypeScript stricts / types Swift ou Rust selon le langage.
3. Élimine les régressions mémoires, les mutations directes et les complexités cyclomatiques inutiles.
4. Ajoute une section courte "Gains & Optimisations" après le code.`,
    promptTemplate: `Langage : {{language}}
Objectif principal : {{refactor_goal}}

Code source à refactoriser :
\`\`\`{{language}}
{{source_code}}
\`\`\`

Contraintes additionnelles : {{constraints}}`,
    inputVariables: [
      {
        id: 'language',
        label: 'Langage',
        type: 'select',
        options: ['TypeScript / JavaScript', 'Swift (macOS/iOS)', 'Python', 'Rust', 'Go', 'HTML / CSS / Tailwind'],
        defaultValue: 'TypeScript / JavaScript',
      },
      {
        id: 'refactor_goal',
        label: 'Objectif de refactorisation',
        type: 'select',
        options: ['Améliorer lisibilité & Typage strict', 'Performance & Réduction de complexité', 'Migration vers moderne (Async/Await, Hooks, etc.)', 'Corriger les bugs & Gestion des erreurs'],
        defaultValue: 'Améliorer lisibilité & Typage strict',
      },
      {
        id: 'source_code',
        label: 'Code source',
        type: 'code',
        placeholder: 'Collez votre code ici...',
        required: true,
      },
      {
        id: 'constraints',
        label: 'Contraintes (optionnel)',
        type: 'text',
        placeholder: 'Ex: Ne pas ajouter de librairies externes, compatible Node 20',
      }
    ],
    samplePresets: [
      {
        language: 'TypeScript / JavaScript',
        refactor_goal: 'Améliorer lisibilité & Typage strict',
        source_code: `function processData(d) {
  var res = [];
  for(var i=0; i<d.length; i++) {
    if(d[i].active == true && d[i].price > 0) {
      res.push({ id: d[i].id, total: d[i].price * (1 + (d[i].tax || 0.2)) });
    }
  }
  return res;
}`,
        constraints: 'Utiliser TypeScript avec interfaces et méthodes fonctionnelles immutables'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'data-json-extractor',
    name: 'Extracteur & Structurateur JSON',
    description: 'Transforme des textes non structurés, factures, relevés ou notes en JSON propre et validé.',
    icon: '📊',
    category: 'data-analysis',
    accentColor: 'from-violet-500 to-purple-700',
    isBuiltIn: true,
    model: 'gemini-3.7-flash',
    temperature: 0.1,
    jsonResponse: true,
    outputFormat: 'json',
    systemInstruction: `Tu es un moteur d'extraction et de structuration de données de haute précision.
Tu extrais toutes les entités clés d'un texte brut et les structures dans un format JSON valide, normalisé et sans ambiguïté.

Règles :
- Réponds STRICTEMENT en JSON valide.
- Normalise les dates au format ISO (YYYY-MM-DD), les prix en nombres flottants avec la devise séparée.
- Si une donnée est absente, utilise null plutôt qu'une chaîne vide inventée.`,
    promptTemplate: `Données brutes / Texte source :
{{raw_data}}

Schéma ou entités souhaitées : {{schema_hints}}
Structure voulue : {{structure_type}}`,
    inputVariables: [
      {
        id: 'raw_data',
        label: 'Texte brut, facture ou extrait à structurer',
        type: 'textarea',
        placeholder: 'Collez ici du texte de facture, liste d\'achats, relevé, formulaire, etc.',
        required: true,
      },
      {
        id: 'structure_type',
        label: 'Type de structure',
        type: 'select',
        options: ['Facture / Ticket de caisse', 'Liste de contacts / Prospects', 'Événements & Rendez-vous', 'Produits & Inventaire', 'Personnalisé (libre)'],
        defaultValue: 'Facture / Ticket de caisse',
      },
      {
        id: 'schema_hints',
        label: 'Champs prioritaires demandés',
        type: 'text',
        placeholder: 'Ex: date, fournisseur, items (description, qte, prix_unitaire), total_ht, tva, total_ttc',
        defaultValue: 'date, fournisseur, total_ht, total_ttc, devises, items',
      }
    ],
    samplePresets: [
      {
        raw_data: 'Facture Apple Store Opéra le 12/03/2026. Achat: MacBook Pro 14 M4 Max (3499.00€ HT), Adaptateur USB-C 140W (105.00€ HT). TVA 20% soit 720.80€. Total réglé CB: 4324.80€ TTC. N° Facture: FA-2026-9812.',
        structure_type: 'Facture / Ticket de caisse',
        schema_hints: 'fournisseur, numero_facture, date, items, total_ht, tva, total_ttc'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'daily-standup-organizer',
    name: 'Planificateur Quotidien & Standup',
    description: 'Transforme votre liste de tâches en plan d\'attaque chronométré avec priorités Eisenhower.',
    icon: '🎯',
    category: 'productivity',
    accentColor: 'from-rose-500 to-pink-600',
    isBuiltIn: true,
    model: 'gemini-3.7-flash',
    temperature: 0.4,
    outputFormat: 'checklist',
    systemInstruction: `Tu es un coach en productivité personnelle pour utilisateurs Mac actifs.
Tu prends une liste chaotique de todos ou de pensées, et tu construis un planning de journée clair, réaliste et motivant avec matrice de priorités.

Format attendu :
1. **Les 3 Priorités Absolues (The Big 3)** : Ce qui doit être fait coûte que coûte aujourd'hui.
2. **Planning Chronologique par Blocs de Temps** (Morning Deep Work, Afternoon Admin, Wrap-up).
3. **Tâches Rapides (<5 min)** : À expédier en batch.
4. **Message pour le Daily Standup** : 3 puces prêtes à copier dans Slack (Hier / Aujourd'hui / Bloquants).`,
    promptTemplate: `Mes tâches et notes pour aujourd'hui :
{{tasks_input}}

Temps de travail disponible : {{working_hours}}
Niveau d'énergie / Mood : {{energy_level}}
Réunions ou contraintes fixes : {{fixed_meetings}}`,
    inputVariables: [
      {
        id: 'tasks_input',
        label: 'Toutes les tâches à faire (en vrac)',
        type: 'textarea',
        placeholder: 'Ex:\n- Finir la maquette Figma\n- Répondre à Paul pour le devis\n- Relancer le dev sur le bug Safari\n- Acheter un café\n- Préparer la prez démo de 16h',
        required: true,
      },
      {
        id: 'working_hours',
        label: 'Temps disponible',
        type: 'select',
        options: ['Journée complète (7-8h)', 'Demi-journée (3-4h)', 'Session intensive (2h)', 'Sprint 1 heure'],
        defaultValue: 'Journée complète (7-8h)',
      },
      {
        id: 'energy_level',
        label: 'Niveau d\'énergie',
        type: 'select',
        options: ['⚡ Maximum (Focus Deep Work)', '🔋 Normal', '☕ Fatigue modérée (Priorité aux tâches douces)'],
        defaultValue: '⚡ Maximum (Focus Deep Work)',
      },
      {
        id: 'fixed_meetings',
        label: 'Réunions ou horaires bloqués',
        type: 'text',
        placeholder: 'Ex: Réunion d\'équipe de 11h à 12h, démo client à 16h',
      }
    ],
    samplePresets: [
      {
        tasks_input: 'Envoyer la proposition commerciale à Acme Corp, relire le contrat juridique, corriger le bug de login sur iOS, review PR de Sophie, appeler le comptable.',
        working_hours: 'Journée complète (7-8h)',
        energy_level: '⚡ Maximum (Focus Deep Work)',
        fixed_meetings: '14h-14h30 Sync marketing'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'research-synthesizer',
    name: 'Synthétiseur de Recherche & Veille',
    description: 'Résume des articles, documentations techniques ou sujets complexes en notes digestes avec recherche web.',
    icon: '🔍',
    category: 'research',
    accentColor: 'from-cyan-500 to-blue-600',
    isBuiltIn: true,
    model: 'gemini-3.7-flash',
    temperature: 0.3,
    enableSearch: true,
    outputFormat: 'markdown',
    systemInstruction: `Tu es un analyste de recherche rigoureux et synthétique.
Tu analyses le sujet ou texte fourni, effectues une recherche web si nécessaire grâce à Google Search, et livres une note de synthèse exécutive structurée.

Structure de la synthèse :
- **Synthèse en 1 phrase (TL;DR)**
- **Les 5 Points Clés & Découvertes majeures**
- **Analyse Détaillée / Avantages & Inconvénients**
- **Impacts & Recommandations concrètes**
- **Sources & Liens utiles consultés**`,
    promptTemplate: `Sujet de recherche ou texte source :
{{subject_or_text}}

Profondeur d'analyse : {{depth}}
Angle d'approche : {{angle}}
Public cible : {{target_audience}}`,
    inputVariables: [
      {
        id: 'subject_or_text',
        label: 'Sujet, URL ou texte d\'étude',
        type: 'textarea',
        placeholder: 'Ex: Quelles sont les nouveautés de macOS Sequoia pour les développeurs, ou résume cette doc technique...',
        required: true,
      },
      {
        id: 'depth',
        label: 'Profondeur de la synthèse',
        type: 'select',
        options: ['Rapide (1 page max, ultra-concis)', 'Approfondie (Détaillé avec nuances et données)', 'Vulgarisation (Accessible à tous)'],
        defaultValue: 'Approfondie (Détaillé avec nuances et données)',
      },
      {
        id: 'angle',
        label: 'Angle de vue',
        type: 'select',
        options: ['Technique & Architecture', 'Stratégique & Business', 'Comparatif / Benchmark', 'Pratique & Tutoriel'],
        defaultValue: 'Technique & Architecture',
      },
      {
        id: 'target_audience',
        label: 'Destinataire de la note',
        type: 'text',
        placeholder: 'Ex: CTO, Développeur junior, Client non-technique',
        defaultValue: 'Équipe technique',
      }
    ],
    samplePresets: [
      {
        subject_or_text: 'Dernières fonctionnalités de Google Gemini 3 et du SDK @google/genai pour la création d\'applications intelligentes',
        depth: 'Approfondie (Détaillé avec nuances et données)',
        angle: 'Technique & Architecture',
        target_audience: 'Développeur Mac / Web'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];
