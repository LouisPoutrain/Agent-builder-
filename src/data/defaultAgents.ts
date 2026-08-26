import { AgentDefinition } from '../types';

export const DEFAULT_AGENTS: AgentDefinition[] = [
  {
    id: 'fullstack-architect',
    name: 'Architecte Full-Stack & Dev',
    description: 'Conçoit, génère et optimise du code pour des applications web, mobiles ou backend complexes.',
    icon: '💻',
    category: 'development',
    accentColor: 'from-blue-500 to-indigo-600',
    isBuiltIn: true,
    model: 'gemini-3.7-flash',
    temperature: 0.2,
    thinkingLevel: 'LOW',
    skills: ['thinking'],
    outputFormat: 'code',
    systemInstruction: `Tu es un ingénieur logiciel Senior (Staff Engineer) expert en architecture Full-Stack, React, Node.js, et design patterns.
Ton objectif est d'analyser le besoin, de proposer une architecture propre et de fournir le code implémentant la solution.

Directives :
1. Fournis le code complet, modulaire et typé.
2. Explique tes choix d'architecture (pourquoi ce pattern, pourquoi cette lib).
3. Assure-toi que le code est sécurisé et gère les erreurs proprement.`,
    promptTemplate: `Tâche de développement : {{task}}
Stack technique cible : {{stack}}
Contraintes de performance / sécurité : {{constraints}}
Contexte existant : {{context}}`,
    inputVariables: [
      {
        id: 'task',
        label: 'Fonctionnalité à développer',
        type: 'textarea',
        placeholder: 'Ex: Créer un système d\'authentification JWT avec rôles RBAC',
        required: true,
      },
      {
        id: 'stack',
        label: 'Stack technique',
        type: 'select',
        options: ['React + TypeScript + Tailwind', 'Node.js + Express + PostgreSQL', 'Next.js + Prisma', 'Python + FastAPI', 'Go + gRPC'],
        defaultValue: 'React + TypeScript + Tailwind',
      },
      {
        id: 'constraints',
        label: 'Contraintes spécifiques',
        type: 'text',
        placeholder: 'Ex: Doit supporter 10k requêtes/sec, ou doit être 100% accessible (a11y)',
      },
      {
        id: 'context',
        label: 'Code existant (optionnel)',
        type: 'code',
        placeholder: 'Collez le code actuel ici...',
      }
    ],
    samplePresets: [
      {
        task: 'Créer un composant React de Datagrid avec tri, filtre et pagination serveur',
        stack: 'React + TypeScript + Tailwind',
        constraints: 'Doit être accessible et utiliser la virtualisation si > 1000 items'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'code-review-agent',
    name: 'Agent de Revue de Code (PR Reviewer)',
    description: 'Analyse les Pull Requests, détecte les bugs, les failles de sécurité et suggère des améliorations.',
    icon: '🛡️',
    category: 'code-review',
    accentColor: 'from-emerald-500 to-teal-700',
    isBuiltIn: true,
    model: 'gemini-3.7-pro',
    temperature: 0.1,
    thinkingLevel: 'HIGH',
    skills: ['thinking'],
    outputFormat: 'markdown',
    systemInstruction: `Tu es un Tech Lead impitoyable mais constructif. Tu effectues des revues de code (Code Reviews) sur les diffs ou extraits de code fournis.
Concentre-toi sur :
1. La sécurité (injections, XSS, fuite de données).
2. Les performances (complexité algorithmique, fuites mémoire).
3. La maintenabilité et les conventions de code (SOLID, DRY).

Réponds avec une liste claire de retours, en citant la ligne problématique et en proposant le code corrigé.`,
    promptTemplate: `Langage/Framework : {{language}}
Focus de la revue : {{focus}}

Code à revoir :
\`\`\`
{{source_code}}
\`\`\`
`,
    inputVariables: [
      {
        id: 'source_code',
        label: 'Code ou Diff (Git) à revoir',
        type: 'code',
        placeholder: 'Collez le diff ou le fichier ici...',
        required: true,
      },
      {
        id: 'language',
        label: 'Langage / Environnement',
        type: 'select',
        options: ['TypeScript / React', 'Python / Django', 'Rust', 'Go', 'Java / Spring', 'C++'],
        defaultValue: 'TypeScript / React',
      },
      {
        id: 'focus',
        label: 'Focus principal de la revue',
        type: 'select',
        options: ['Sécurité maximale', 'Optimisation des performances', 'Lisibilité et Clean Code', 'Architecture Globale'],
        defaultValue: 'Sécurité maximale',
      }
    ],
    samplePresets: [
      {
        language: 'TypeScript / React',
        focus: 'Sécurité maximale',
        source_code: `function loadUser(id: string) {
  db.query("SELECT * FROM users WHERE id = " + id);
  return <div dangerouslySetInnerHTML={{__html: user.bio}} />
}`
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'research-synthesizer',
    name: 'Assistant de Recherche & Documentation',
    description: 'Cherche sur le web, synthétise des documentations techniques et génère des notes architecturales.',
    icon: '🔍',
    category: 'research',
    accentColor: 'from-cyan-500 to-blue-600',
    isBuiltIn: true,
    model: 'gemini-3.7-flash',
    temperature: 0.3,
    enableSearch: true,
    skills: ['search'],
    outputFormat: 'markdown',
    systemInstruction: `Tu es un Technical Writer et Chercheur en R&D.
Tu analyses le sujet technologique, effectues une recherche web si nécessaire pour avoir les infos les plus à jour (dernières versions d'API, etc.), et livres une synthèse technique structurée.

Structure :
- **TL;DR (1 phrase)**
- **Concepts Clés & Nouvelles API**
- **Exemples d'implémentation**
- **Impacts & Recommandations**
- **Sources & Liens**`,
    promptTemplate: `Sujet de recherche technique :
{{subject_or_text}}

Profondeur requise : {{depth}}
Angle d'approche : {{angle}}`,
    inputVariables: [
      {
        id: 'subject_or_text',
        label: 'Technologie, API ou Concept à rechercher',
        type: 'textarea',
        placeholder: 'Ex: Comment utiliser React Server Components avec Apollo GraphQL...',
        required: true,
      },
      {
        id: 'depth',
        label: 'Profondeur',
        type: 'select',
        options: ['Aperçu rapide', 'Analyse détaillée avec code', 'Comparatif technique'],
        defaultValue: 'Analyse détaillée avec code',
      },
      {
        id: 'angle',
        label: 'Angle de vue',
        type: 'select',
        options: ['Architecture', 'Implémentation pratique', 'Sécurité', 'Performance'],
        defaultValue: 'Implémentation pratique',
      }
    ],
    samplePresets: [
      {
        subject_or_text: 'Intégration de la Gemini API (Google Gen AI SDK) en Node.js avec les features de Function Calling',
        depth: 'Analyse détaillée avec code',
        angle: 'Implémentation pratique'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'agile-scrum-planner',
    name: 'Scrum Master & Planificateur Agile',
    description: 'Découpe des epics en tickets JIRA/Linear, rédige des user stories et organise des sprints.',
    icon: '📋',
    category: 'planning',
    accentColor: 'from-amber-500 to-orange-600',
    isBuiltIn: true,
    model: 'gemini-3.7-flash',
    temperature: 0.4,
    outputFormat: 'checklist',
    systemInstruction: `Tu es un Scrum Master / Product Owner Agile certifié.
Tu prends un besoin métier (Epic ou Feature) et tu le découpes en User Stories prêtes pour le développement (INVEST).

Format attendu par ticket :
- **Titre** : [Composant] Action claire
- **User Story** : En tant que X, je veux Y afin de Z.
- **Critères d'acceptation (Gherkin/Given-When-Then)** : Liste précise.
- **Complexité estimée** : (Fibonacci ou T-shirt size)`,
    promptTemplate: `Besoin métier / Fonctionnalité (Epic) :
{{epic_description}}

Type d'équipe : {{team_type}}
Niveau de granularité : {{granularity}}`,
    inputVariables: [
      {
        id: 'epic_description',
        label: 'Description de la fonctionnalité',
        type: 'textarea',
        placeholder: 'Ex: Les utilisateurs doivent pouvoir s\'authentifier via Google, Github ou Email/Mot de passe avec 2FA.',
        required: true,
      },
      {
        id: 'team_type',
        label: 'Profil de l\'équipe',
        type: 'select',
        options: ['Full-stack squad', 'Équipe Backend (API only)', 'Équipe Frontend'],
        defaultValue: 'Full-stack squad',
      },
      {
        id: 'granularity',
        label: 'Découpage',
        type: 'select',
        options: ['Macro (Grandes étapes)', 'Micro (Tâches < 1 jour de dev)'],
        defaultValue: 'Micro (Tâches < 1 jour de dev)',
      }
    ],
    samplePresets: [
      {
        epic_description: 'Création d\'un système de panier E-commerce avec gestion des stocks en temps réel et codes promo.',
        team_type: 'Full-stack squad',
        granularity: 'Micro (Tâches < 1 jour de dev)'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];
