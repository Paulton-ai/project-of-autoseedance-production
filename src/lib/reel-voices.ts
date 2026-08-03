// Inworld TTS voice catalogue (Fal.ai fal-ai/inworld-tts).
// The value sent to the API is the full enum string, e.g. "Sarah (en)".
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

export const voiceValue = (name: string, code: string) => `${name} (${code})`;

export const DEFAULT_VOICE = "Sarah (en)";
