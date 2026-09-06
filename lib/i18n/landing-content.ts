import type { Language } from "@/store/language-store";

export interface LandingFeature {
  title: string;
  description: string;
}

export interface LandingPathContent {
  title: string;
  description: string;
  bullets: string[];
  cta: string;
  /** Nota informativa bajo el CTA (ej. "tu administrador crea tu cuenta"). */
  footnote?: string;
  /** Link secundario bajo el CTA (ej. "¿Ya tienes cuenta? Inicia sesión"). */
  secondaryCta?: string;
  secondaryHref?: string;
}

export interface LandingStep {
  title: string;
  description: string;
}

export interface LandingContent {
  nav: {
    login: string;
    register: string;
    languageToggleLabel: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
  };
  howItWorks: {
    heading: string;
    subheading: string;
    steps: LandingStep[];
  };
  features: {
    heading: string;
    items: LandingFeature[];
  };
  choosePath: {
    heading: string;
    subheading: string;
    student: LandingPathContent;
    teacher: LandingPathContent;
  };
  guide: {
    name: string;
    tagline: string;
    greeting: string;
    question: string;
    userExample: string;
    answerExample: string;
    inputPlaceholder: string;
    badgeAvailable: string;
    badgeFeedback: string;
  };
  footer: {
    tagline: string;
    rights: string;
  };
}

export const landingContent: Record<Language, LandingContent> = {
  en: {
    nav: {
      login: "Login",
      register: "Register",
      languageToggleLabel: "Español",
    },
    hero: {
      badge: "WELCOME TO ECOGUIDE TRAINING",
      title: "Practice English. Guide with Confidence.",
      subtitle:
        "An interactive platform designed for tourism students to improve their communication skills through realistic tour guide scenarios.",
      cta: "Start Practicing",
    },
    howItWorks: {
      heading: "How it works",
      subheading: "From sign-up to your first badge, in four simple steps.",
      steps: [
        {
          title: "Create your free account",
          description:
            "Sign up in seconds and jump straight into your first protected area.",
        },
        {
          title: "Choose a protected area",
          description:
            "Explore El Salvador's protected areas and pick where you want to guide.",
        },
        {
          title: "Practice: chatbot, quizzes & speaking",
          description:
            "Chat with the virtual guide, take the area quiz, and record your speaking practice.",
        },
        {
          title: "Track progress & earn badges",
          description:
            "Get real-time feedback and collect badges as you complete each challenge.",
        },
      ],
    },
    features: {
      heading: "Everything you need to become a confident guide",
      items: [
        {
          title: "Chat With a Virtual Guide",
          description:
            "Practice real conversations with our chatbot, just like guiding real tourists.",
        },
        {
          title: "Protected Areas Quiz",
          description: "Take tests about each protected area and put what you learned to use.",
        },
        {
          title: "Improve Your Speaking",
          description: "Record yourself and build fluency and confidence in English.",
        },
        {
          title: "Real-Time Feedback",
          description:
            "Get instant feedback on your answers and pronunciation as you practice.",
        },
      ],
    },
    choosePath: {
      heading: "Choose your path",
      subheading:
        "Whether you're a student practicing to guide tourists, or a teacher building the content, EcoGuide has a place for you.",
      student: {
        title: "I'm a student",
        description: "Practice real guiding scenarios and track your own progress.",
        bullets: [
          "Chat with a virtual guide in realistic scenarios",
          "Solve quizzes about each protected area",
          "Earn badges as you complete challenges",
        ],
        cta: "Create free account",
        secondaryCta: "Already have an account? Log in",
        secondaryHref: "/login",
      },
      teacher: {
        title: "I'm a teacher",
        description: "Build the content your students practice with.",
        bullets: [
          "Create and manage protected areas",
          "Design flashcards, quizzes, and speaking practice",
          "Track every student's progress",
        ],
        cta: "Sign in as teacher",
        footnote: "Teacher accounts are created by an administrator.",
      },
    },
    guide: {
      name: "Eco",
      tagline:
        "Practice real conversations with Eco about every protected area — instant replies, day or night.",
      greeting: "Hi! I'm Eco, your tour guide.",
      question: "Where would you like to travel today?",
      userExample: "Tell me about El Imposible National Park!",
      answerExample:
        "El Imposible is home to over 500 bird species and stunning waterfalls! Want tips on the best trail for beginners?",
      inputPlaceholder: "Type your message...",
      badgeAvailable: "Available 24/7",
      badgeFeedback: "Instant feedback",
    },
    footer: {
      tagline: "Practice English. Guide with Confidence.",
      rights: "All rights reserved.",
    },
  },
  es: {
    nav: {
      login: "Iniciar sesión",
      register: "Registrarse",
      languageToggleLabel: "English",
    },
    hero: {
      badge: "BIENVENIDO A ECOGUIDE TRAINING",
      title: "Practica inglés. Guía con confianza.",
      subtitle:
        "Una plataforma interactiva diseñada para estudiantes de turismo que buscan mejorar sus habilidades de comunicación a través de escenarios reales de guía turístico.",
      cta: "Comenzar a practicar",
    },
    howItWorks: {
      heading: "Cómo funciona",
      subheading: "Del registro a tu primera insignia, en cuatro simples pasos.",
      steps: [
        {
          title: "Crea tu cuenta gratis",
          description:
            "Regístrate en segundos y entra directo a tu primera área protegida.",
        },
        {
          title: "Elige un área protegida",
          description:
            "Explora las áreas protegidas de El Salvador y elige dónde quieres guiar.",
        },
        {
          title: "Practica: chatbot, quizzes y speaking",
          description:
            "Conversa con el guía virtual, resuelve el quiz del área y graba tu práctica de speaking.",
        },
        {
          title: "Sigue tu progreso y gana insignias",
          description:
            "Recibe retroalimentación en tiempo real y colecciona insignias al completar cada reto.",
        },
      ],
    },
    features: {
      heading: "Todo lo que necesitas para ser un guía seguro de sí mismo",
      items: [
        {
          title: "Conversa con un guía virtual",
          description:
            "Practica conversaciones reales con nuestro chatbot, como si guiaras turistas de verdad.",
        },
        {
          title: "Quiz de áreas protegidas",
          description: "Responde tests sobre cada área protegida y pon a prueba lo aprendido.",
        },
        {
          title: "Mejora tu speaking",
          description: "Grábate y desarrolla fluidez y confianza en inglés.",
        },
        {
          title: "Retroalimentación en tiempo real",
          description:
            "Recibe feedback inmediato sobre tus respuestas y pronunciación mientras practicas.",
        },
      ],
    },
    choosePath: {
      heading: "Elige tu camino",
      subheading:
        "Ya seas estudiante practicando para guiar turistas, o docente creando el contenido, EcoGuide tiene un espacio para ti.",
      student: {
        title: "Soy estudiante",
        description:
          "Practica escenarios reales de guía turístico y sigue tu propio progreso.",
        bullets: [
          "Conversa con un guía virtual en escenarios reales",
          "Resuelve quizzes sobre cada área protegida",
          "Gana insignias al completar los retos",
        ],
        cta: "Crear cuenta gratis",
        secondaryCta: "¿Ya tienes cuenta? Inicia sesión",
        secondaryHref: "/login",
      },
      teacher: {
        title: "Soy docente",
        description: "Crea el contenido con el que practican tus estudiantes.",
        bullets: [
          "Crea y administra áreas protegidas",
          "Diseña flashcards, quizzes y práctica oral",
          "Sigue el progreso de cada estudiante",
        ],
        cta: "Acceder como docente",
        footnote: "Las cuentas de docente las crea un administrador.",
      },
    },
    guide: {
      name: "Eco",
      tagline:
        "Practica conversaciones reales con Eco sobre cada área protegida — respuestas al instante, a cualquier hora.",
      greeting: "¡Hola! Soy Eco, tu guía turístico.",
      question: "¿A dónde te gustaría viajar hoy?",
      userExample: "¡Cuéntame sobre el Parque El Imposible!",
      answerExample:
        "¡El Imposible tiene más de 500 especies de aves y cascadas impresionantes! ¿Quieres consejos para el mejor sendero para principiantes?",
      inputPlaceholder: "Escribe tu mensaje...",
      badgeAvailable: "Disponible 24/7",
      badgeFeedback: "Feedback al instante",
    },
    footer: {
      tagline: "Practica inglés. Guía con confianza.",
      rights: "Todos los derechos reservados.",
    },
  },
};
