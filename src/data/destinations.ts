import type { Lang } from "@/i18n/I18nProvider";

type L = { en: string; ar: string };

export type Destination = {
  id: string;
  name: L;
  category: "emergency" | "clinic" | "service" | "amenity";
  floor: L;
  wing: L;
  walkMinutes: number;
  x: number;
  y: number;
  path: Array<[number, number]>;
  icon: string;
  description: L;
  hours: L;
  isOpen24: boolean;
  phone: string;
  tips: L[];
};

// Default entrance (Main Entrance at the top-right of the O.T floor plan)
export const ENTRANCE: [number, number] = [373, 13];

export type StartPoint = {
  id: string;
  name: L;
  description: L;
  x: number;
  y: number;
  icon: string;
};

// Two QR-encoded start points visible on the O.T map
export const START_POINTS: StartPoint[] = [
  {
    id: "main-entrance",
    name: { en: "Main Entrance", ar: "المدخل الرئيسي" },
    description: { en: "Top-right corridor of O.T floor", ar: "الممر الأيمن العلوي لطابق العمليات" },
    x: 373,
    y: 13,
    icon: "🚪",
  },
  {
    id: "entrance",
    name: { en: "Entrance", ar: "المدخل" },
    description: { en: "Lower-right corridor of O.T floor", ar: "الممر الأيمن السفلي لطابق العمليات" },
    x: 377,
    y: 334,
    icon: "🚶",
  },
];

export const getStartPoint = (id: string | null | undefined): StartPoint =>
  START_POINTS.find((s) => s.id === id) ?? START_POINTS[0];

export const localized = (l: L, lang: Lang) => l[lang];

const defaultOrHours: L = {
  en: "Sun – Thu · 7:30 AM – 6:00 PM · Emergencies 24/7",
  ar: "الأحد – الخميس · ٧:٣٠ ص – ٦:٠٠ م · الطوارئ ٢٤/٧",
};
const defaultOrTips: L[] = [
  {
    en: "Report to the O.T reception before entering the sterile zone.",
    ar: "توجّه إلى استقبال العمليات قبل دخول المنطقة المعقمة.",
  },
  {
    en: "Only authorised staff and pre-approved visitors are allowed inside.",
    ar: "الدخول مسموح فقط للموظفين المصرح لهم والزوار المعتمدين.",
  },
];

const floor: L = { en: "Level 2 · O.T", ar: "الطابق الثاني · العمليات" };

type OROverrides = {
  icon?: string;
  description?: L;
  hours?: L;
  tips?: L[];
  isOpen24?: boolean;
};

const makeOR = (
  id: string,
  nameEn: string,
  nameAr: string,
  x: number,
  y: number,
  path: Array<[number, number]>,
  overrides: OROverrides = {}
): Destination => ({
  id,
  name: { en: nameEn, ar: nameAr },
  category: "clinic",
  floor,
  wing: { en: "O.T Wing", ar: "جناح العمليات" },
  walkMinutes: 2,
  x,
  y,
  path,
  icon: overrides.icon ?? "🏥",
  description: overrides.description ?? {
    en: `${nameEn} — Level 2 operating theatre`,
    ar: `${nameAr} — غرفة عمليات في الطابق الثاني`,
  },
  hours: overrides.hours ?? defaultOrHours,
  isOpen24: overrides.isOpen24 ?? false,
  phone: "+973 1728 8000",
  tips: overrides.tips ?? defaultOrTips,
});

// Shared corridor waypoints (viewBox 400x430)
// Top approach from Main Entrance down to the middle/bottom corridors
const TOP_ENTRY: [number, number] = [373, 13];
const TOP_CORNER: [number, number] = [373, 45];
const LEFT_SPINE_TOP: [number, number] = [94, 45];
const MID_CORRIDOR_Y = 246;
const BOTTOM_CORRIDOR_Y = 336;

const toMid = (x: number): Array<[number, number]> => [
  TOP_ENTRY, TOP_CORNER, LEFT_SPINE_TOP, [94, MID_CORRIDOR_Y], [x, MID_CORRIDOR_Y],
];
const toBottom = (x: number): Array<[number, number]> => [
  TOP_ENTRY, TOP_CORNER, LEFT_SPINE_TOP, [94, BOTTOM_CORRIDOR_Y], [x, BOTTOM_CORRIDOR_Y],
];

export const DESTINATIONS: Destination[] = [
  makeOR("or-main", "Operation Room", "غرفة العمليات", 55, 235, [
    ...toMid(94), [55, MID_CORRIDOR_Y], [55, 235],
  ], {
    icon: "🏥",
    description: {
      en: "Main operating room — general surgery and multi-specialty procedures.",
      ar: "غرفة العمليات الرئيسية — جراحة عامة وإجراءات متعددة التخصصات.",
    },
    hours: { en: "Daily · 24 hours (on-call surgical team)", ar: "يومياً · ٢٤ ساعة (فريق جراحي عند الطلب)" },
    isOpen24: true,
    tips: [
      { en: "Emergency surgeries take priority — scheduled cases may shift.", ar: "الجراحات الطارئة لها الأولوية — قد تتأخر الحالات المجدولة." },
      { en: "Family waiting area is on the right corridor near reception.", ar: "منطقة انتظار العائلة في الممر الأيمن قرب الاستقبال." },
    ],
  }),
  makeOR("or-8", "Operation Room 8", "غرفة العمليات 8", 150, 199, [
    ...toMid(150), [150, 199],
  ], {
    description: {
      en: "OR-8 — Orthopaedic surgery suite (joint replacement, trauma).",
      ar: "غرفة العمليات ٨ — جراحة العظام (استبدال المفاصل، الرضوض).",
    },
    hours: { en: "Sun – Thu · 8:00 AM – 4:00 PM", ar: "الأحد – الخميس · ٨:٠٠ ص – ٤:٠٠ م" },
    tips: [
      { en: "Remark: Fasting required 8 hours before elective surgery.", ar: "ملاحظة: الصيام مطلوب ٨ ساعات قبل الجراحة الاختيارية." },
      { en: "Bring your recent X-rays and MRI on the day of surgery.", ar: "أحضر أشعتك السينية والرنين المغناطيسي الحديثة يوم العملية." },
    ],
  }),
  makeOR("or-9", "Operation Room 9", "غرفة العمليات 9", 220, 199, [
    ...toMid(220), [220, 199],
  ], {
    description: {
      en: "OR-9 — General surgery (laparoscopic and open procedures).",
      ar: "غرفة العمليات ٩ — الجراحة العامة (المنظار والجراحة المفتوحة).",
    },
    hours: { en: "Sun – Thu · 7:30 AM – 3:30 PM", ar: "الأحد – الخميس · ٧:٣٠ ص – ٣:٣٠ م" },
    tips: [
      { en: "Remark: Same-day discharge for most laparoscopic cases.", ar: "ملاحظة: خروج في نفس اليوم لمعظم حالات المنظار." },
      { en: "Consent form must be signed 24 hours before surgery.", ar: "يجب توقيع نموذج الموافقة قبل ٢٤ ساعة من العملية." },
    ],
  }),
  makeOR("or-10", "Operation Room 10", "غرفة العمليات 10", 283, 199, [
    ...toMid(283), [283, 199],
  ], {
    description: {
      en: "OR-10 — ENT and ophthalmology procedures.",
      ar: "غرفة العمليات ١٠ — إجراءات الأنف والأذن والحنجرة والعيون.",
    },
    hours: { en: "Mon, Wed · 8:00 AM – 2:00 PM", ar: "الاثنين، الأربعاء · ٨:٠٠ ص – ٢:٠٠ م" },
    tips: [
      { en: "Remark: Eye surgeries scheduled first — arrive 60 min early.", ar: "ملاحظة: جراحات العيون تُجدول أولاً — احضر قبل ٦٠ دقيقة." },
      { en: "Do not wear contact lenses or eye makeup on the day.", ar: "لا ترتدِ العدسات اللاصقة أو مكياج العين يوم العملية." },
    ],
  }),
  makeOR("ot-7", "Operation Theatre 7", "غرفة العمليات 7", 183, 314, [
    ...toBottom(183), [183, 314],
  ], {
    description: {
      en: "OT-7 — Day-case surgery and minor procedures.",
      ar: "غرفة العمليات ٧ — جراحة اليوم الواحد والإجراءات البسيطة.",
    },
    hours: { en: "Sun – Thu · 8:00 AM – 2:00 PM", ar: "الأحد – الخميس · ٨:٠٠ ص – ٢:٠٠ م" },
    tips: [
      { en: "Remark: Patients discharged same day — arrange transport home.", ar: "ملاحظة: الخروج في نفس اليوم — رتب وسيلة نقل للمنزل." },
    ],
  }),
  makeOR("ot-12", "Operation Theatre 12", "غرفة العمليات 12", 318, 278, [
    ...toMid(318), [318, 278],
  ], {
    description: {
      en: "OT-12 — Cardiothoracic and vascular surgery.",
      ar: "غرفة العمليات ١٢ — جراحة القلب والصدر والأوعية الدموية.",
    },
    hours: { en: "Tue, Thu · 7:00 AM – 5:00 PM · Emergencies 24/7", ar: "الثلاثاء، الخميس · ٧:٠٠ ص – ٥:٠٠ م · الطوارئ ٢٤/٧" },
    isOpen24: true,
    tips: [
      { en: "Remark: Restricted access — ICU team escort required for family.", ar: "ملاحظة: الدخول مقيد — يلزم مرافقة فريق العناية المركزة للعائلة." },
      { en: "Pre-op cardiac clearance is mandatory.", ar: "التقييم القلبي قبل العملية إلزامي." },
    ],
  }),
  makeOR("plaster", "Plaster Room", "غرفة الجبس", 106, 278, [
    ...toMid(106), [106, 278],
  ], {
    icon: "🦴",
    description: {
      en: "Plaster / cast application, removal, and orthopaedic dressings.",
      ar: "تركيب وإزالة الجبس والضمادات العظمية.",
    },
    hours: { en: "Sat – Thu · 8:00 AM – 8:00 PM", ar: "السبت – الخميس · ٨:٠٠ ص – ٨:٠٠ م" },
    tips: [
      { en: "Remark: Walk-ins accepted; orthopaedic referral preferred.", ar: "ملاحظة: يُقبل بدون موعد؛ يُفضّل تحويل من العظام." },
      { en: "Keep the cast dry — bring a plastic cover for showering.", ar: "احتفظ بالجبس جافاً — أحضر غطاءً بلاستيكياً للاستحمام." },
    ],
  }),
  makeOR("ot-14", "Operation Theatre 14", "غرفة العمليات 14", 146, 385, [
    ...toBottom(146), [146, 385],
  ], {
    description: {
      en: "OT-14 — Urology and endoscopic procedures.",
      ar: "غرفة العمليات ١٤ — المسالك البولية وإجراءات المناظير.",
    },
    hours: { en: "Sun, Tue · 8:00 AM – 3:00 PM", ar: "الأحد، الثلاثاء · ٨:٠٠ ص – ٣:٠٠ م" },
    tips: [
      { en: "Remark: Follow the pre-op hydration instructions strictly.", ar: "ملاحظة: اتبع تعليمات الترطيب قبل العملية بدقة." },
    ],
  }),
  makeOR("ot-15", "Operation Theatre 15", "غرفة العمليات 15", 196, 385, [
    ...toBottom(196), [196, 385],
  ], {
    description: {
      en: "OT-15 — Obstetrics and gynaecology surgery.",
      ar: "غرفة العمليات ١٥ — جراحة النساء والولادة.",
    },
    hours: { en: "Daily · 24 hours (on-call OB team)", ar: "يومياً · ٢٤ ساعة (فريق النساء والولادة عند الطلب)" },
    isOpen24: true,
    tips: [
      { en: "Remark: Partner may accompany during scheduled C-sections.", ar: "ملاحظة: يمكن للشريك المرافقة أثناء العمليات القيصرية المجدولة." },
    ],
  }),
  makeOR("ot-16", "Operation Theatre 16", "غرفة العمليات 16", 247, 385, [
    ...toBottom(247), [247, 385],
  ], {
    description: {
      en: "OT-16 — Paediatric surgery suite.",
      ar: "غرفة العمليات ١٦ — جراحة الأطفال.",
    },
    hours: { en: "Sun – Thu · 8:00 AM – 4:00 PM", ar: "الأحد – الخميس · ٨:٠٠ ص – ٤:٠٠ م" },
    tips: [
      { en: "Remark: One parent may stay in recovery with the child.", ar: "ملاحظة: يُسمح لأحد الوالدين بالبقاء مع الطفل في الإفاقة." },
      { en: "Bring the child's comfort item (toy or blanket).", ar: "أحضر غرضاً مريحاً للطفل (لعبة أو بطانية)." },
    ],
  }),
  makeOR("ot-17", "Operation Theatre 17", "غرفة العمليات 17", 293, 385, [
    ...toBottom(293), [293, 385],
  ], {
    description: {
      en: "OT-17 — Neurosurgery and complex spine procedures.",
      ar: "غرفة العمليات ١٧ — جراحة الأعصاب والعمود الفقري المعقدة.",
    },
    hours: { en: "Mon, Wed · 7:00 AM – 6:00 PM · Emergencies 24/7", ar: "الاثنين، الأربعاء · ٧:٠٠ ص – ٦:٠٠ م · الطوارئ ٢٤/٧" },
    isOpen24: true,
    tips: [
      { en: "Remark: Extended surgeries — family updates every 2 hours.", ar: "ملاحظة: عمليات طويلة — تحديثات للعائلة كل ساعتين." },
      { en: "Post-op ICU stay is expected for at least 24 hours.", ar: "من المتوقع البقاء في العناية المركزة بعد العملية لمدة ٢٤ ساعة على الأقل." },
    ],
  }),
];


export const CATEGORIES = [
  { id: "all", emoji: "📍", key: "catAll" as const },
  { id: "clinic", emoji: "🏥", key: "catClinics" as const },
];

// Corridor-following paths per (destinationId, startPointId).
// Generated to follow only the grey corridor (color code #cec3b1) on the floor plan.
export const PATHS: Record<string, Record<string, Array<[number, number]>>> = {
  "or-main": {
    "main-entrance": [[373, 13], [252.6, 13.0], [252.0, 27.1], [240.3, 47.5], [112.7, 60.9], [112.7, 234.9], [55, 235]],
    "entrance": [[377, 334], [141.3, 322.5], [141.3, 268.1], [112.7, 234.9], [55, 235]],
  },
  "or-8": {
    "main-entrance": [[373, 13], [252.6, 13.0], [252.0, 27.1], [240.3, 47.5], [125.0, 59.6], [125.0, 246.1], [142.9, 246.6], [142.9, 211.6], [150, 199]],
    "entrance": [[377, 334], [142.9, 322.7], [142.9, 211.6], [150, 199]],
  },
  "or-9": {
    "main-entrance": [[373, 13], [252.6, 13.0], [252.0, 27.1], [240.3, 47.5], [125.0, 59.6], [125.0, 246.1], [223.3, 246.6], [223.3, 217.0], [220, 199]],
    "entrance": [[377, 334], [153.2, 323.2], [153.2, 259.3], [223.3, 246.4], [223.3, 217.0], [220, 199]],
  },
  "or-10": {
    "main-entrance": [[373, 13], [252.6, 13.0], [252.0, 27.1], [240.3, 47.5], [125.0, 59.6], [125.0, 246.1], [268.3, 246.6], [283, 199]],
    "entrance": [[377, 334], [153.2, 323.2], [153.2, 259.3], [268.3, 246.6], [283, 199]],
  },
  "ot-7": {
    "main-entrance": [[373, 13], [252.6, 13.0], [252.0, 27.1], [240.3, 47.5], [125.0, 59.6], [125.0, 246.1], [153.2, 284.7], [153.2, 322.5], [181.2, 323.2], [181.2, 316.0], [183, 314]],
    "entrance": [[377, 334], [181.2, 323.2], [181.2, 316.0], [183, 314]],
  },
  "ot-12": {
    "main-entrance": [[373, 13], [252.6, 13.0], [252.0, 27.1], [240.3, 47.5], [125.0, 59.6], [125.0, 246.1], [153.2, 284.7], [153.2, 322.5], [318.0, 323.2], [318, 278]],
    "entrance": [[377, 334], [318.0, 325.0], [318.0, 323.2], [318, 278]],
  },
  "plaster": {
    "main-entrance": [[373, 13], [252.6, 13.0], [252.0, 27.1], [240.3, 47.5], [114.2, 60.7], [114.2, 275.2], [106, 278]],
    "entrance": [[377, 334], [141.3, 322.5], [141.3, 268.1], [114.2, 267.4], [114.2, 275.2], [106, 278]],
  },
  "ot-14": {
    "main-entrance": [[373, 13], [252.6, 13.0], [252.0, 27.1], [240.3, 47.5], [125.0, 59.6], [125.0, 246.1], [149.4, 279.3], [149.4, 378.9], [146, 385]],
    "entrance": [[377, 334], [149.4, 333.5], [149.4, 378.9], [146, 385]],
  },
  "ot-15": {
    "main-entrance": [[373, 13], [252.6, 13.0], [252.0, 27.1], [240.3, 47.5], [125.0, 59.6], [125.0, 246.1], [153.2, 284.7], [153.2, 322.5], [194.6, 336.8], [194.6, 380.1], [196, 385]],
    "entrance": [[377, 334], [194.6, 333.5], [194.6, 380.1], [196, 385]],
  },
  "ot-16": {
    "main-entrance": [[373, 13], [252.6, 13.0], [252.0, 27.1], [240.3, 47.5], [125.0, 59.6], [125.0, 246.1], [153.2, 284.7], [153.2, 322.5], [252.0, 333.7], [252.0, 378.9], [247, 385]],
    "entrance": [[377, 334], [252.0, 333.5], [252.0, 378.9], [247, 385]],
  },
  "ot-17": {
    "main-entrance": [[373, 13], [252.6, 13.0], [252.0, 27.1], [240.3, 47.5], [125.0, 59.6], [125.0, 246.1], [153.2, 284.7], [153.2, 322.5], [261.8, 334.6], [261.8, 372.4], [293, 385]],
    "entrance": [[377, 334], [261.8, 333.5], [261.8, 372.4], [293, 385]],
  },
};
