// Inworld TTS voice catalogue + branded demo sentence per language.
// Kept in sync with src/lib/reel-voices.ts
export type VoiceGroup = { language: string; code: string; names: string[] };

export const VOICE_GROUPS: VoiceGroup[] = [
  {
    language: "English",
    code: "en",
    names: [
      "Loretta", "Darlene", "Marlene", "Hank", "Evelyn", "Celeste", "Pippa", "Tessa",
      "Liam", "Callum", "Hamish", "Abby", "Graham", "Rupert", "Mortimer", "Snik",
      "Anjali", "Saanvi", "Arjun", "Claire", "Oliver", "Simon", "Elliot", "James",
      "Serena", "Gareth", "Vinny", "Lauren", "Jessica", "Ethan", "Tyler", "Jason",
      "Chloe", "Veronica", "Victoria", "Miranda", "Sebastian", "Victor", "Malcolm",
      "Kayla", "Nate", "Jake", "Brian", "Amina", "Kelsey", "Derek", "Grant", "Evan",
      "Alex", "Ashley", "Craig", "Deborah", "Dennis", "Edward", "Elizabeth", "Hades",
      "Julia", "Pixie", "Mark", "Olivia", "Priya", "Ronald", "Sarah", "Shaun",
      "Theodore", "Timothy", "Wendy", "Dominus", "Hana", "Clive", "Carter", "Blake", "Luna",
    ],
  },
  { language: "Chinese", code: "zh", names: ["Yichen", "Xiaoyin", "Xinyi", "Jing"] },
  { language: "Dutch", code: "nl", names: ["Erik", "Katrien", "Lennart", "Lore"] },
  { language: "French", code: "fr", names: ["Alain", "Hélène", "Mathieu", "Étienne"] },
  { language: "German", code: "de", names: ["Johanna", "Josef"] },
  { language: "Italian", code: "it", names: ["Gianni", "Orietta"] },
  { language: "Japanese", code: "ja", names: ["Asuka", "Satoshi"] },
  { language: "Korean", code: "ko", names: ["Hyunwoo", "Minji", "Seojun", "Yoona"] },
  { language: "Polish", code: "pl", names: ["Szymon", "Wojciech"] },
  { language: "Portuguese", code: "pt", names: ["Heitor", "Maitê"] },
  { language: "Spanish", code: "es", names: ["Diego", "Lupita", "Miguel", "Rafael"] },
  { language: "Russian", code: "ru", names: ["Svetlana", "Elena", "Dmitry", "Nikolai"] },
  { language: "Hindi", code: "hi", names: ["Riya", "Manoj"] },
  { language: "Hebrew", code: "he", names: ["Yael", "Oren"] },
  { language: "Arabic", code: "ar", names: ["Nour", "Omar"] },
];

// Brand name "AutoSeedance" stays untranslated in every language.
export const DEMO_SENTENCES: Record<string, string> = {
  en: "Welcome to AutoSeedance — this is a preview of how your video voiceover will sound.",
  zh: "欢迎使用 AutoSeedance——这是您的视频配音效果预览。",
  nl: "Welkom bij AutoSeedance — dit is een voorbeeld van hoe je videovoice-over zal klinken.",
  fr: "Bienvenue sur AutoSeedance — voici un aperçu du rendu de la voix off de votre vidéo.",
  de: "Willkommen bei AutoSeedance — so wird das Voiceover für Ihr Video klingen.",
  it: "Benvenuto su AutoSeedance — ecco un'anteprima di come suonerà la voce fuori campo del tuo video.",
  ja: "AutoSeedance へようこそ。これはあなたの動画ナレーションの音声プレビューです。",
  ko: "AutoSeedance에 오신 것을 환영합니다. 영상 내레이션이 어떻게 들릴지 미리 들어보세요.",
  pl: "Witamy w AutoSeedance — tak będzie brzmiał lektor w Twoim filmie.",
  pt: "Bem-vindo ao AutoSeedance — esta é uma prévia de como ficará a narração do seu vídeo.",
  es: "Bienvenido a AutoSeedance: esta es una muestra de cómo sonará la voz en off de tu vídeo.",
  ru: "Добро пожаловать в AutoSeedance — так будет звучать закадровый голос в вашем видео.",
  hi: "AutoSeedance में आपका स्वागत है — यह एक झलक है कि आपके वीडियो की आवाज़ कैसी सुनाई देगी।",
  he: "ברוכים הבאים ל-AutoSeedance — כך יישמע הקריינות בסרטון שלכם.",
  ar: "مرحبًا بك في AutoSeedance — هذه معاينة لكيفية سماع التعليق الصوتي في الفيديو الخاص بك.",
};

export const voiceValue = (name: string, code: string) => `${name} (${code})`;

export const voiceSlug = (name: string, code: string) =>
  `${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${code}`;
