// Internationalization translations

export type Language = 'en' | 'fr';

export const translations = {
  en: {
    // Welcome page
    welcome: {
      title: 'MORPHOS',
      subtitle: 'Parametric 3D Parts Generator',
      description: 'Professional technical parts with precise dimensions',
      tagline: 'AI-powered parametric design for engineers, makers, and product designers',
      getStarted: 'Start Creating',
      useCases: {
        title: 'WHO IS MORPHOS FOR?',
        productDesigner: {
          title: 'Product Designers',
          desc: 'Custom mechanical parts with exact dimensions for rapid prototyping'
        },
        electronics: {
          title: 'Electronics Engineers',
          desc: 'PCB enclosures, component mounts, and custom connectors'
        },
        engineer: {
          title: 'Mechanical Engineers',
          desc: 'Replacement parts, fixtures, and industrial-grade components'
        },
        maker: {
          title: 'Makers & Hobbyists',
          desc: 'Functional parts for DIY projects and technical repairs'
        }
      },
      features: {
        title: 'WHY MORPHOS?',
        precision: {
          title: 'Parametric Precision',
          desc: 'Exact dimensions to the millimeter with ISO/DIN standards'
        },
        ai: {
          title: 'Technical AI',
          desc: 'Understands engineering vocabulary and generates parametric JSCAD code'
        },
        export: {
          title: 'Professional Export',
          desc: 'STL, G-Code, OBJ, 3MF - Ready for manufacturing'
        }
      },
      examples: {
        title: 'GENERATE IN SECONDS',
        screw: 'M8 x 30mm screw',
        enclosure: 'Arduino Uno enclosure',
        mount: 'NEMA 17 motor mount',
        connector: 'DIN rail connector'
      }
    },
    // Navigation
    nav: {
      projects: 'Projects',
      newProject: 'New Project',
      parameters: 'Parameters',
      settings: 'Settings'
    },
    // Actions
    actions: {
      create: 'Create',
      modify: 'Modify',
      adjust: 'Adjust',
      export: 'Export',
      download: 'Download',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      delete: 'Delete',
      code: 'Code',
      retry: 'Retry'
    },
    // AI Chat
    chat: {
      title: 'AI Assistant',
      subtitle: 'Morphos AI',
      placeholder: 'Describe your 3D model...',
      listening: 'Listening...',
      generating: 'Generating...',
      uploadSketch: 'Upload sketch',
      speakTo3D: 'Speak to 3D',
      quotaInfo: 'Free API - Limit: 20 requests/day',
      quotaDesc: 'If you exceed the limit, wait 24h or use your own API key.',
      learnMore: 'Learn more'
    },
    // Quick prompts
    prompts: {
      create: {
        screw: 'Create Screw',
        washer: 'Create Washer',
        nut: 'Create Nut',
        gear: 'Create Gear',
        box: 'Create Box',
        cylinder: 'Create Cylinder'
      },
      modify: {
        increaseSize: 'Increase Size',
        makeThinner: 'Make Thinner',
        addHoles: 'Add Holes',
        addChamfer: 'Add Chamfer',
        aluminum: 'Aluminum',
        redPlastic: 'Red Plastic'
      }
    },
    // Messages
    messages: {
      noProject: 'No Project',
      noModel: 'No model',
      compiling: 'Compiling...',
      createToday: 'What will you create today?',
      describeModel: 'Describe your 3D model to get started',
      startCreating: 'Start Creating',
      clickToStart: 'Click to start creating',
      describeYourModel: 'Describe your 3D model',
      modifyYourModel: 'Modify your model',
      noModelSelected: 'No Model Selected',
      createModelToAdjust: 'Create a model to adjust parameters',
      noParametersFound: 'No Parameters Found',
      parametersAutoDetected: 'Parameters are auto-detected from the code',
      changesUpdateRealtime: 'Changes update the model in real-time',
      currentModel: 'Current Model',
      resetToOriginal: 'Reset to original values',
      collapseParameters: 'Collapse parameters',
      expandParameters: 'Expand parameters',
      savePreset: 'Save Preset',
      savedPresets: 'Saved Presets',
      presetName: 'Preset name:'
    },
    // Errors
    errors: {
      quotaExceeded: 'API quota exceeded. Free limit reached (20 requests/day). Please try again later or check your API plan.',
      invalidApiKey: 'Invalid or missing API key. Check your configuration.',
      networkError: 'Connection error. Check your internet connection.',
      generationError: 'An error occurred during generation.',
      invalidPrompt: 'Invalid or empty prompt.',
      invalidImage: 'Invalid image. Please upload a valid image (PNG, JPEG, GIF, WebP) under 5MB.'
    },
    // Export
    export: {
      title: 'Export Model',
      format: 'Format',
      settings: 'Settings',
      gcode: 'G-Code Settings',
      layerHeight: 'Layer Height',
      nozzleTemp: 'Nozzle Temperature',
      bedTemp: 'Bed Temperature',
      printSpeed: 'Print Speed',
      travelSpeed: 'Travel Speed',
      infillDensity: 'Infill Density'
    },
    // Settings
    settings: {
      language: 'Language',
      theme: 'Theme',
      apiKey: 'API Key'
    },
    // Materials
    materials: {
      title: 'Materials',
      category: 'Category',
      color: 'Color',
      metalness: 'Metalness',
      roughness: 'Roughness',
      opacity: 'Opacity',
      presets: 'Presets',
      brushedAlu: 'Brushed Alu',
      polishedSteel: 'Polished Steel',
      mattePlastic: 'Matte Plastic',
      transparent: 'Transparent',
      metals: 'Metals',
      plastics: 'Plastics',
      others: 'Others'
    }
  },
  fr: {
    // Welcome page
    welcome: {
      title: 'MORPHOS',
      subtitle: 'Générateur de Pièces 3D Paramétriques',
      description: 'Pièces techniques professionnelles avec dimensions précises',
      tagline: 'Conception paramétrique par IA pour ingénieurs, makers et designers produit',
      getStarted: 'Commencer',
      useCases: {
        title: 'POUR QUI EST MORPHOS ?',
        productDesigner: {
          title: 'Designers Produit',
          desc: 'Pièces mécaniques sur mesure avec dimensions exactes pour prototypage rapide'
        },
        electronics: {
          title: 'Électroniciens',
          desc: 'Boîtiers PCB, supports de composants et connecteurs personnalisés'
        },
        engineer: {
          title: 'Ingénieurs Mécaniques',
          desc: 'Pièces de rechange, fixations et composants de qualité industrielle'
        },
        maker: {
          title: 'Makers & Hobbyistes',
          desc: 'Pièces fonctionnelles pour projets DIY et réparations techniques'
        }
      },
      features: {
        title: 'POURQUOI MORPHOS ?',
        precision: {
          title: 'Précision Paramétrique',
          desc: 'Dimensions exactes au millimètre avec normes ISO/DIN'
        },
        ai: {
          title: 'IA Technique',
          desc: 'Comprend le vocabulaire technique et génère du code JSCAD paramétrique'
        },
        export: {
          title: 'Export Professionnel',
          desc: 'STL, G-Code, OBJ, 3MF - Prêt pour la fabrication'
        }
      },
      examples: {
        title: 'GÉNÉREZ EN QUELQUES SECONDES',
        screw: 'Vis M8 x 30mm',
        enclosure: 'Boîtier Arduino Uno',
        mount: 'Support moteur NEMA 17',
        connector: 'Connecteur rail DIN'
      }
    },
    // Navigation
    nav: {
      projects: 'Projets',
      newProject: 'Nouveau Projet',
      parameters: 'Paramètres',
      settings: 'Réglages'
    },
    // Actions
    actions: {
      create: 'Créer',
      modify: 'Modifier',
      adjust: 'Ajuster',
      export: 'Exporter',
      download: 'Télécharger',
      save: 'Enregistrer',
      cancel: 'Annuler',
      close: 'Fermer',
      delete: 'Supprimer',
      code: 'Code',
      retry: 'Réessayer'
    },
    // AI Chat
    chat: {
      title: 'Assistant IA',
      subtitle: 'Morphos IA',
      placeholder: 'Décrivez votre modèle 3D...',
      listening: 'Écoute...',
      generating: 'Génération...',
      uploadSketch: 'Télécharger un croquis',
      speakTo3D: 'Parler en 3D',
      quotaInfo: 'API Gratuite - Limite: 20 requêtes/jour',
      quotaDesc: 'Si vous dépassez la limite, attendez 24h ou utilisez votre propre clé API.',
      learnMore: 'En savoir plus'
    },
    // Quick prompts
    prompts: {
      create: {
        screw: 'Créer Vis',
        washer: 'Créer Rondelle',
        nut: 'Créer Écrou',
        gear: 'Créer Engrenage',
        box: 'Créer Boîte',
        cylinder: 'Créer Cylindre'
      },
      modify: {
        increaseSize: 'Augmenter Taille',
        makeThinner: 'Réduire Épaisseur',
        addHoles: 'Ajouter Trous',
        addChamfer: 'Ajouter Chanfreins',
        aluminum: 'Aluminium',
        redPlastic: 'Plastique Rouge'
      }
    },
    // Messages
    messages: {
      noProject: 'Aucun Projet',
      noModel: 'Aucun modèle',
      compiling: 'Compilation...',
      createToday: 'Que créerez-vous aujourd\'hui ?',
      describeModel: 'Décrivez votre modèle 3D pour commencer',
      startCreating: 'Commencer à Créer',
      clickToStart: 'Cliquez pour commencer',
      describeYourModel: 'Décrivez votre modèle 3D',
      modifyYourModel: 'Modifiez votre modèle',
      noModelSelected: 'Aucun Modèle Sélectionné',
      createModelToAdjust: 'Créez un modèle pour ajuster les paramètres',
      noParametersFound: 'Aucun Paramètre Trouvé',
      parametersAutoDetected: 'Les paramètres sont détectés automatiquement depuis le code',
      changesUpdateRealtime: 'Les modifications mettent à jour le modèle en temps réel',
      currentModel: 'Modèle Actuel',
      resetToOriginal: 'Réinitialiser aux valeurs d\'origine',
      collapseParameters: 'Réduire les paramètres',
      expandParameters: 'Développer les paramètres',
      savePreset: 'Enregistrer Préréglage',
      savedPresets: 'Préréglages Enregistrés',
      presetName: 'Nom du préréglage :'
    },
    // Errors
    errors: {
      quotaExceeded: 'Quota API dépassé. Limite gratuite atteinte (20 requêtes/jour). Veuillez réessayer plus tard ou vérifier votre plan API.',
      invalidApiKey: 'Clé API invalide ou manquante. Vérifiez votre configuration.',
      networkError: 'Erreur de connexion. Vérifiez votre connexion internet.',
      generationError: 'Une erreur est survenue lors de la génération.',
      invalidPrompt: 'Prompt invalide ou vide.',
      invalidImage: 'Image invalide. Veuillez télécharger une image valide (PNG, JPEG, GIF, WebP) de moins de 5MB.'
    },
    // Export
    export: {
      title: 'Exporter le Modèle',
      format: 'Format',
      settings: 'Paramètres',
      gcode: 'Paramètres G-Code',
      layerHeight: 'Hauteur de Couche',
      nozzleTemp: 'Température Buse',
      bedTemp: 'Température Plateau',
      printSpeed: 'Vitesse d\'Impression',
      travelSpeed: 'Vitesse de Déplacement',
      infillDensity: 'Densité de Remplissage'
    },
    // Settings
    settings: {
      language: 'Langue',
      theme: 'Thème',
      apiKey: 'Clé API'
    },
    // Materials
    materials: {
      title: 'Matériaux',
      category: 'Catégorie',
      color: 'Couleur',
      metalness: 'Métal',
      roughness: 'Rugosité',
      opacity: 'Opacité',
      presets: 'Préréglages',
      brushedAlu: 'Alu Brossé',
      polishedSteel: 'Acier Poli',
      mattePlastic: 'Plastique Mat',
      transparent: 'Transparent',
      metals: 'Métaux',
      plastics: 'Plastiques',
      others: 'Autres'
    }
  }
} as const;
