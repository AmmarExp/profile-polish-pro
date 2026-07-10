import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

export const dict: Dict = {
  // Nav
  "nav.features": { ar: "المزايا", en: "Features" },
  "nav.pricing": { ar: "الأسعار", en: "Pricing" },
  "nav.how": { ar: "كيف يعمل", en: "How it works" },
  "nav.login": { ar: "تسجيل الدخول", en: "Sign in" },
  "nav.start": { ar: "ابدأ مجاناً", en: "Start free" },
  "nav.dashboard": { ar: "لوحة التحكم", en: "Dashboard" },
  "nav.posts": { ar: "المنشورات", en: "Posts" },
  "nav.settings": { ar: "الإعدادات", en: "Settings" },
  "nav.billing": { ar: "الاشتراك", en: "Billing" },
  "nav.linkedin": { ar: "ربط لينكدإن", en: "LinkedIn" },
  "nav.admin": { ar: "لوحة الأدمن", en: "Admin" },
  "nav.logout": { ar: "خروج", en: "Sign out" },

  // Hero
  "hero.badge": { ar: "مساعدك الذكي على لينكدإن", en: "Your AI LinkedIn co-pilot" },
  "hero.title": {
    ar: "انشر بانتظام، انمُ بلا مجهود، واحصل على وظائف أفضل",
    en: "Post consistently, grow effortlessly, land better jobs",
  },
  "hero.subtitle": {
    ar: "اربط حسابك على لينكدإن ودع الذكاء الاصطناعي يكتب وينشر عنك محتوى يومي مبني على تخصصك وأهدافك، مع توصيات لتقوية ملفك.",
    en: "Connect your LinkedIn and let AI craft and publish daily posts tailored to your expertise and goals — plus recommendations to sharpen your profile.",
  },
  "hero.cta": { ar: "جرّب 3 منشورات مجاناً", en: "Try 3 posts free" },
  "hero.cta2": { ar: "شاهد كيف يعمل", en: "See how it works" },

  // Features
  "feat.title": { ar: "لماذا ريتش لينك؟", en: "Why ReachLink?" },
  "feat.subtitle": {
    ar: "كل ما تحتاجه لتبني علامتك المهنية على لينكدإن — بذكاء صناعي عربي/إنجليزي.",
    en: "Everything you need to build your professional brand on LinkedIn — in Arabic or English.",
  },
  "feat.1.title": { ar: "منشورات يومية بذكاء", en: "AI daily posting" },
  "feat.1.desc": {
    ar: "يكتب الذكاء الاصطناعي منشورات مبنية على تخصصك وتوجهك ويجدولها تلقائياً.",
    en: "AI writes posts matching your specialty and schedules them automatically.",
  },
  "feat.2.title": { ar: "توصيات لتحسين ملفك", en: "Profile boost tips" },
  "feat.2.desc": {
    ar: "تحليل ذكي لملفك مع اقتراحات لتقوية العنوان والنبذة والخبرات لجذب الفرص.",
    en: "Smart profile analysis with tips to strengthen headline, about, and experience.",
  },
  "feat.3.title": { ar: "تحكم كامل بالنبرة", en: "Full tone control" },
  "feat.3.desc": {
    ar: "اختر نبرة ودودة، رسمية، ملهمة، تعليمية أو حادة الذكاء — كما يناسبك.",
    en: "Choose friendly, formal, inspiring, educational, or witty — as it fits you.",
  },
  "feat.4.title": { ar: "جدولة مرنة", en: "Flexible scheduling" },
  "feat.4.desc": {
    ar: "حدد كم منشور في اليوم وفي أي وقت، أو دع الذكاء ينشر عنك.",
    en: "Set posts per day and time — or let AI publish for you.",
  },
  "feat.5.title": { ar: "عربي وإنجليزي", en: "Arabic & English" },
  "feat.5.desc": {
    ar: "واجهة كاملة بالعربي والإنجليزي، والمحتوى ينشر باللغة التي تختارها.",
    en: "Full UI in Arabic and English, with content in the language you choose.",
  },
  "feat.6.title": { ar: "نتائج قابلة للقياس", en: "Measurable growth" },
  "feat.6.desc": {
    ar: "شاهد كيف تتحسن الفرص والتفاعل مع كل منشور جديد.",
    en: "Watch engagement and opportunities grow with every new post.",
  },

  // Compare section
  "compare.title": { ar: "الفرق قبل وبعد", en: "Before & after" },
  "compare.subtitle": {
    ar: "ملف عادي بلا تفاعل مقابل ملف نشِط يجذب الفرص.",
    en: "A quiet profile vs. an active one that attracts opportunities.",
  },
  "compare.jobs": {
    ar: "احصل على عروض وظيفية بمعدل أعلى بـ 3× حين تنشر بانتظام.",
    en: "Get up to 3× more job offers when you post consistently.",
  },

  // How
  "how.title": { ar: "كيف يعمل؟", en: "How it works" },
  "how.1.t": { ar: "أنشئ حساباً", en: "Create account" },
  "how.1.d": { ar: "سجّل خلال 30 ثانية بالبريد.", en: "Sign up in 30 seconds with email." },
  "how.2.t": { ar: "اربط لينكدإن", en: "Connect LinkedIn" },
  "how.2.d": { ar: "ربط آمن بضغطة واحدة.", en: "One-click secure connect." },
  "how.3.t": { ar: "خصّص أهدافك ونبرتك", en: "Set goals & tone" },
  "how.3.d": { ar: "أخبرنا عن تخصصك وأسلوبك.", en: "Tell us your niche and style." },
  "how.4.t": { ar: "دع الذكاء ينشر", en: "Let AI publish" },
  "how.4.d": { ar: "منشورات يومية تلقائياً.", en: "Daily posts, automatically." },

  // Pricing
  "price.title": { ar: "خطط بسيطة تنمو معك", en: "Simple plans that grow with you" },
  "price.free.t": { ar: "التجربة المجانية", en: "Free trial" },
  "price.free.p": { ar: "٠", en: "0" },
  "price.free.d": { ar: "٣ منشورات لاختبار الذكاء الاصطناعي بعد ربط حسابك.", en: "3 posts to try the AI after connecting." },
  "price.pro.t": { ar: "Pro شهري", en: "Pro monthly" },
  "price.pro.d": { ar: "منشورات يومية غير محدودة + توصيات ذكية.", en: "Unlimited daily posts + smart tips." },
  "price.yearly.t": { ar: "Pro سنوي", en: "Pro yearly" },
  "price.yearly.d": { ar: "وفّر شهرين مع الاشتراك السنوي.", en: "Save 2 months with yearly." },
  "price.month": { ar: "/شهر", en: "/mo" },
  "price.year": { ar: "/سنة", en: "/yr" },
  "price.cta": { ar: "ابدأ الآن", en: "Get started" },
  "price.pop": { ar: "الأكثر شهرة", en: "Most popular" },

  // Footer
  "foot.rights": { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },

  // Auth
  "auth.signin": { ar: "تسجيل الدخول", en: "Sign in" },
  "auth.signup": { ar: "إنشاء حساب", en: "Create account" },
  "auth.email": { ar: "البريد الإلكتروني", en: "Email" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.name": { ar: "الاسم الكامل", en: "Full name" },
  "auth.have": { ar: "لديك حساب؟", en: "Have an account?" },
  "auth.no": { ar: "لا يوجد حساب؟", en: "No account?" },
  "auth.welcome": { ar: "أهلاً بعودتك", en: "Welcome back" },
  "auth.create": { ar: "أنشئ حسابك", en: "Create your account" },

  // Dashboard
  "dash.welcome": { ar: "مرحباً", en: "Welcome" },
  "dash.trial": { ar: "منشورات تجريبية متبقية", en: "Trial posts remaining" },
  "dash.status": { ar: "حالة الحساب", en: "Account status" },
  "dash.linkedin": { ar: "لينكدإن", en: "LinkedIn" },
  "dash.connected": { ar: "متصل", en: "Connected" },
  "dash.notconnected": { ar: "غير متصل", en: "Not connected" },
  "dash.connectnow": { ar: "اربط الآن", en: "Connect now" },
  "dash.recent": { ar: "أحدث المنشورات", en: "Recent posts" },
  "dash.recs": { ar: "توصيات لتحسين ملفك", en: "Profile recommendations" },
  "dash.generate": { ar: "أنشئ منشور تجريبي", en: "Generate a post" },
  "dash.analyze": { ar: "حلّل ملفي", en: "Analyze my profile" },
  "dash.noposts": { ar: "لا توجد منشورات بعد", en: "No posts yet" },
  "dash.norecs": { ar: "لا توجد توصيات بعد — جرّب التحليل.", en: "No recommendations yet — try analyzing." },

  // Posts
  "posts.title": { ar: "منشوراتك", en: "Your posts" },
  "posts.new": { ar: "منشور جديد", en: "New post" },
  "posts.topic": { ar: "الموضوع (اختياري)", en: "Topic (optional)" },
  "posts.generate": { ar: "توليد بالذكاء", en: "Generate with AI" },
  "posts.content": { ar: "المحتوى", en: "Content" },
  "posts.save": { ar: "حفظ كمسودة", en: "Save draft" },
  "posts.schedule": { ar: "جدولة", en: "Schedule" },
  "posts.publishnow": { ar: "نشر الآن", en: "Publish now" },
  "posts.status.draft": { ar: "مسودة", en: "Draft" },
  "posts.status.scheduled": { ar: "مجدول", en: "Scheduled" },
  "posts.status.published": { ar: "منشور", en: "Published" },
  "posts.status.failed": { ar: "فشل", en: "Failed" },

  // Settings
  "set.title": { ar: "الإعدادات", en: "Settings" },
  "set.profile": { ar: "الملف الشخصي", en: "Profile" },
  "set.specialty": { ar: "التخصص", en: "Specialty" },
  "set.industry": { ar: "القطاع", en: "Industry" },
  "set.goal": { ar: "هدفك من المنشورات", en: "Your posting goal" },
  "set.tone": { ar: "نبرة الذكاء الاصطناعي", en: "AI tone" },
  "set.lang": { ar: "لغة المحتوى", en: "Content language" },
  "set.headline": { ar: "العنوان المهني", en: "Headline" },
  "set.bio": { ar: "نبذة", en: "Bio" },
  "set.schedule": { ar: "الجدولة", en: "Schedule" },
  "set.perday": { ar: "منشورات في اليوم", en: "Posts per day" },
  "set.times": { ar: "أوقات النشر (HH:MM مفصولة بفواصل)", en: "Publish times (HH:MM comma-separated)" },
  "set.tz": { ar: "المنطقة الزمنية", en: "Timezone" },
  "set.auto": { ar: "توليد ونشر تلقائي بالكامل", en: "Fully automatic AI publishing" },
  "set.active": { ar: "الجدولة مفعّلة", en: "Schedule active" },
  "set.save": { ar: "حفظ", en: "Save" },
  "set.saved": { ar: "تم الحفظ", en: "Saved" },

  // Tones
  "tone.friendly": { ar: "ودودة", en: "Friendly" },
  "tone.formal": { ar: "رسمية", en: "Formal" },
  "tone.inspiring": { ar: "ملهمة", en: "Inspiring" },
  "tone.educational": { ar: "تعليمية", en: "Educational" },
  "tone.witty": { ar: "ذكية/طريفة", en: "Witty" },

  // Billing
  "bill.title": { ar: "الاشتراك والباقات", en: "Subscription & plans" },
  "bill.current": { ar: "خطتك الحالية", en: "Your current plan" },
  "bill.upgrade": { ar: "ترقية", en: "Upgrade" },
  "bill.soon": { ar: "سيتم ربط الدفع عبر Paddle قريباً.", en: "Paddle checkout will be wired up next." },

  // LinkedIn
  "li.title": { ar: "ربط حساب لينكدإن", en: "Connect LinkedIn" },
  "li.desc": {
    ar: "ربط لينكدإن سيمكن الذكاء الاصطناعي من النشر تلقائياً بالنيابة عنك. سنقوم بتفعيل الربط في الخطوة القادمة.",
    en: "Connecting LinkedIn lets AI publish on your behalf. We'll wire this up next.",
  },
  "li.connect": { ar: "ربط الحساب", en: "Connect account" },
  "li.simulate": { ar: "محاكاة الربط للاختبار", en: "Simulate connection for testing" },

  // Admin
  "admin.title": { ar: "لوحة السوبر أدمن", en: "Super admin" },
  "admin.users": { ar: "المستخدمون", en: "Users" },
  "admin.subs": { ar: "الاشتراكات", en: "Subscriptions" },
  "admin.prompts": { ar: "قوالب الذكاء", en: "AI templates" },
  "admin.analytics": { ar: "الإحصائيات", en: "Analytics" },
  "admin.total.users": { ar: "إجمالي المستخدمين", en: "Total users" },
  "admin.active": { ar: "اشتراكات نشطة", en: "Active subs" },
  "admin.posts.today": { ar: "منشورات اليوم", en: "Posts today" },
  "admin.no.access": { ar: "ليس لديك صلاحية الوصول.", en: "You don't have access." },

  // Onboarding
  "onb.title": { ar: "أهلاً بك! لنجهّز حسابك", en: "Welcome! Let's set you up" },
  "onb.subtitle": { ar: "٣ خطوات سريعة ليبدأ الذكاء الاصطناعي بالكتابة عنك.", en: "Three quick steps so AI can start writing for you." },
  "onb.s1": { ar: "من أنت؟", en: "Who are you?" },
  "onb.s2": { ar: "تخصصك وهدفك", en: "Your niche & goal" },
  "onb.s3": { ar: "الأسلوب واللغة", en: "Voice & language" },
  "onb.finish": { ar: "ابدأ الآن", en: "Get started" },

  // Insights
  "ins.title": { ar: "تحليلات منشوراتك", en: "Post insights" },
  "ins.total": { ar: "إجمالي المنشورات", en: "Total posts" },
  "ins.per14": { ar: "منشورات آخر 14 يوم", en: "Posts (last 14 days)" },
  "ins.status": { ar: "توزيع الحالات", en: "Status breakdown" },
  "ins.summary": { ar: "ملخص سريع", en: "Quick summary" },
  "nav.insights": { ar: "التحليلات", en: "Insights" },
  "nav.recs": { ar: "التوصيات", en: "Tips" },

  // Recommendations
  "recs.title": { ar: "توصيات لتحسين ملفك", en: "Profile recommendations" },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: keyof typeof dict) => string;
  dir: "rtl" | "ltr";
};

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null;
    if (stored === "ar" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = (k: keyof typeof dict) => dict[k]?.[lang] ?? String(k);

  return (
    <I18nCtx.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
