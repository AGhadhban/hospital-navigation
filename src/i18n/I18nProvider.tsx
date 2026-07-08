import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

type Dict = {
  appName: string;
  hospital: string;
  help: string;
  greetingHead: string;
  greetingHighlight: string;
  greetingSub: string;
  searchPlaceholder: string;
  noResults: string;
  walk: string;
  min: string;
  m: string;
  liveGps: string;
  mainEntrance: string;
  walkingTo: string;
  arrived: string;
  closeRoute: string;
  next: string;
  step: string;
  of: string;
  in: string;
  time: string;
  distance: string;
  progress: string;
  turnByTurn: string;
  totalSteps: (m: number, n: number) => string;
  remaining: (m: number) => string;
  pause: string;
  resume: string;
  done: string;
  open24: string;
  openToday: string;
  call: string;
  hours: string;
  phone: string;
  helpfulTips: string;
  footerHelp: string;
  startingFrom: string;
  changeStart: string;
  pickStart: string;
  pickStartHint: string;
  qrCodes: string;
  qrHint: string;
  scanToStart: string;
  copyLink: string;
  copied: string;
  print: string;
  directionMode: string;
  modeLiveGps: string;
  modeWalking: string;
  liveGpsNote: string;


  // Categories
  catAll: string;
  catEmergency: string;
  catClinics: string;
  catServices: string;
  // Directions
  headStraight: string;
  turnLeft: string;
  turnRight: string;
  uTurn: string;
  arriveAt: (name: string) => string;
  walkM: (m: number) => string;
  headFor: (compass: string, m: number) => string;
  // Compass
  north: string;
  northEast: string;
  east: string;
  southEast: string;
  south: string;
  southWest: string;
  west: string;
  northWest: string;
  // Step intros
  exitLobby: string;
  takeElevatorTo: (floor: string) => string;
  followSigns: (wing: string) => string;
};

const en: Dict = {
  appName: "HospitalWay",
  hospital: "Salmaniya Medical Complex",
  help: "Help",
  greetingHead: "Welcome.",
  greetingHighlight: "Where can we take you today?",
  greetingSub: "Tap a destination — we'll guide you step-by-step using live GPS.",
  searchPlaceholder: "Search room, doctor, service…",
  noResults: "No places match your search.",
  walk: "walk",
  min: "min",
  m: "m",
  liveGps: "Live GPS",
  mainEntrance: "🚪 Main Entrance",
  walkingTo: "Walking to",
  arrived: "✅ You have arrived",
  closeRoute: "Close route",
  next: "Next",
  step: "Step",
  of: "of",
  in: "In",
  time: "Time",
  distance: "Distance",
  progress: "Progress",
  turnByTurn: "Turn-by-turn directions",
  totalSteps: (m, n) => `Total ${m} m · ${n} steps`,
  remaining: (m) => `${m} m remaining`,
  pause: "⏸  Pause walking",
  resume: "▶  Resume walking",
  done: "🎉  Done — pick another place",
  open24: "Open 24/7",
  openToday: "Open today",
  call: "📞 Call",
  hours: "Hours",
  phone: "Phone",
  helpfulTips: "Helpful tips",
  footerHelp: "Need help? Visit the front desk or dial 0 on any courtesy phone.",
  startingFrom: "Starting from",
  changeStart: "Change",
  pickStart: "Where are you right now?",
  pickStartHint: "Pick your current location — or scan the QR code at your spot.",
  qrCodes: "QR codes for each location",
  qrHint: "Print and place these at their real spots. Scanning opens the app with the visitor's start position already set.",
  scanToStart: "Scan to start here",
  copyLink: "Copy link",
  copied: "Copied ✓",
  print: "🖨 Print all",
  directionMode: "Direction mode",
  modeLiveGps: "📡 Live GPS",
  modeWalking: "🚶 Walking to",
  liveGpsNote: "Live GPS is tracking your real position. Walking simulation is paused.",

  catAll: "All places",
  catEmergency: "Emergency",
  catClinics: "Clinics",
  catServices: "Services",
  headStraight: "Continue straight",
  turnLeft: "Turn left",
  turnRight: "Turn right",
  uTurn: "Make a U-turn",
  arriveAt: (name) => ` — arrive at ${name}`,
  walkM: (m) => ` and walk ${m} m`,
  headFor: (compass, m) => `Head ${compass} for ${m} m`,
  north: "north",
  northEast: "north-east",
  east: "east",
  southEast: "south-east",
  south: "south",
  southWest: "south-west",
  west: "west",
  northWest: "north-west",
  exitLobby: "Exit through the Main Entrance and head into the lobby.",
  takeElevatorTo: (floor) => `Take the elevators up to ${floor}.`,
  followSigns: (wing) => `Follow signs toward the ${wing}.`,
};

const ar: Dict = {
  appName: "هوسبيتال وَي",
  hospital: "مجمع السلمانية الطبي",
  help: "مساعدة",
  greetingHead: "أهلاً بك.",
  greetingHighlight: "إلى أين نأخذك اليوم؟",
  greetingSub: "اضغط على الوجهة — سنرشدك خطوة بخطوة باستخدام الـ GPS المباشر.",
  searchPlaceholder: "ابحث عن غرفة، طبيب، أو خدمة…",
  noResults: "لا توجد نتائج مطابقة لبحثك.",
  walk: "مشي",
  min: "دقيقة",
  m: "م",
  liveGps: "GPS مباشر",
  mainEntrance: "🚪 المدخل الرئيسي",
  walkingTo: "المشي إلى",
  arrived: "✅ لقد وصلت",
  closeRoute: "إغلاق المسار",
  next: "التالي",
  step: "خطوة",
  of: "من",
  in: "خلال",
  time: "الوقت",
  distance: "المسافة",
  progress: "التقدم",
  turnByTurn: "إرشادات خطوة بخطوة",
  totalSteps: (m, n) => `الإجمالي ${m} م · ${n} خطوات`,
  remaining: (m) => `يتبقى ${m} م`,
  pause: "⏸  إيقاف مؤقت",
  resume: "▶  متابعة المشي",
  done: "🎉  تم — اختر وجهة أخرى",
  open24: "مفتوح ٢٤/٧",
  openToday: "مفتوح اليوم",
  call: "📞 اتصال",
  hours: "ساعات العمل",
  phone: "الهاتف",
  helpfulTips: "نصائح مفيدة",
  footerHelp: "تحتاج مساعدة؟ توجه إلى الاستقبال أو اطلب 0 من أي هاتف داخلي.",
  startingFrom: "نقطة البداية",
  changeStart: "تغيير",
  pickStart: "أين أنت الآن؟",
  pickStartHint: "اختر موقعك الحالي — أو امسح رمز QR الموجود في مكانك.",
  qrCodes: "رموز QR لكل موقع",
  qrHint: "اطبع هذه الرموز وضعها في أماكنها الحقيقية. عند المسح، يفتح التطبيق مع تعيين نقطة بداية الزائر تلقائياً.",
  scanToStart: "امسح لتبدأ من هنا",
  copyLink: "نسخ الرابط",
  copied: "تم النسخ ✓",
  print: "🖨 طباعة الكل",
  directionMode: "وضع الإرشاد",
  modeLiveGps: "📡 GPS مباشر",
  modeWalking: "🚶 المشي إلى",
  liveGpsNote: "يتتبع GPS المباشر موقعك الفعلي. تم إيقاف محاكاة المشي.",

  catAll: "كل الأماكن",
  catEmergency: "الطوارئ",
  catClinics: "العيادات",
  catServices: "الخدمات",
  headStraight: "استمر مباشرة",
  turnLeft: "انعطف يساراً",
  turnRight: "انعطف يميناً",
  uTurn: "استدر للخلف",
  arriveAt: (name) => ` — الوصول إلى ${name}`,
  walkM: (m) => ` وامشِ ${m} م`,
  headFor: (compass, m) => `اتجه ${compass} لمسافة ${m} م`,
  north: "شمالاً",
  northEast: "شمال شرق",
  east: "شرقاً",
  southEast: "جنوب شرق",
  south: "جنوباً",
  southWest: "جنوب غرب",
  west: "غرباً",
  northWest: "شمال غرب",
  exitLobby: "اخرج من المدخل الرئيسي وتوجه إلى الردهة.",
  takeElevatorTo: (floor) => `استخدم المصعد للصعود إلى ${floor}.`,
  followSigns: (wing) => `اتبع اللافتات باتجاه ${wing}.`,
};

const dictionaries: Record<Lang, Dict> = { en, ar };

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<I18nCtx | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem("hw_lang") as Lang | null;
    return saved === "ar" ? "ar" : "en";
  });

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem("hw_lang", lang);
  }, [lang, dir]);

  const setLang = (l: Lang) => setLangState(l);

  return (
    <Ctx.Provider value={{ lang, setLang, t: dictionaries[lang], dir }}>
      {children}
    </Ctx.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
