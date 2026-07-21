import type { Language } from "@/store/language-store";

export interface LandingFeature {
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
  features: {
    heading: string;
    items: LandingFeature[];
  };
  guide: {
    name: string;
    greeting: string;
    question: string;
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
    features: {
      heading: "Everything you need to become a confident guide",
      items: [
        {
          title: "Practice Real Conversations",
          description:
            "Answer questions and give directions like a real tour guide.",
        },
        {
          title: "Protected Areas Quiz",
          description: "Test your knowledge about each protected area.",
        },
        {
          title: "Improve Your Speaking",
          description: "Build fluency and confidence in English.",
        },
      ],
    },
    guide: {
      name: "Eco",
      greeting: "Hi! I'm Eco, your tour guide.",
      question: "Where would you like to travel today?",
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
    features: {
      heading: "Todo lo que necesitas para ser un guía seguro de sí mismo",
      items: [
        {
          title: "Practica conversaciones reales",
          description:
            "Responde preguntas y da direcciones como un guía turístico real.",
        },
        {
          title: "Quiz de áreas protegidas",
          description: "Pon a prueba tus conocimientos sobre cada área protegida.",
        },
        {
          title: "Mejora tu speaking",
          description: "Desarrolla fluidez y confianza en inglés.",
        },
      ],
    },
    guide: {
      name: "Eco",
      greeting: "¡Hola! Soy Eco, tu guía turístico.",
      question: "¿A dónde te gustaría viajar hoy?",
    },
    footer: {
      tagline: "Practica inglés. Guía con confianza.",
      rights: "Todos los derechos reservados.",
    },
  },
};
