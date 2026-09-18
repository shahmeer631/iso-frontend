
declare global {
  namespace NodeJS {
    interface Timeout {}
  }

  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          config: {
            pageLanguage: string;
            includedLanguages: string;
            layout?: number;
            autoDisplay?: boolean;
            multilanguagePage?: boolean;
          },
          elementId: string
        ) => void;
        InlineLayout?: {
          SIMPLE: number;
          HORIZONTAL: number;
          VERTICAL: number;
        };
      };
    };
    googleTranslateElementInit?: () => void;
    googleTranslateLoaded?: boolean;
  }
}

declare module 'lucide-react';

export {};
