export type Lang = 'en' | 'ar'

export const t = {
  en: {
    title: 'dayfold — Accessible Headless Date Picker for React & Vue',
    description:
      'Tiny (7 kB) accessible date picker for React, Vue and JS. Headless, WCAG 2.2, range selection, Hijri, Persian and every Intl calendar. Zero dependencies.',
    nav: {
      docs: 'Docs',
      gallery: 'Gallery',
      field: 'Field',
      a11y: 'Accessibility',
      size: 'Size',
      lang: 'العربية',
    },
    eyebrow: 'Headless date picker · v0.1',
    heroTitle: ['The date picker that', 'folds into', 'your design.'],
    heroLead:
      'dayfold gives you the hard parts — calendar math, keyboard navigation, ARIA and focus — and none of the markup. Every Intl calendar, Hijri included, in about 7 kB with zero dependencies.',
    copy: 'Copy',
    copied: 'Copied',
    readDocs: 'Read the docs',
    controls: {
      calendar: 'Calendar',
      locale: 'Language',
      mode: 'Selection',
      second: 'Second calendar',
    },
    calendars: {
      gregory: 'Gregorian',
      'islamic-umalqura': 'Hijri (Umm al-Qura)',
      persian: 'Persian',
      hebrew: 'Hebrew',
      buddhist: 'Buddhist',
    } as Record<string, string>,
    none: 'None',
    modes: { single: 'Single', range: 'Range', multiple: 'Multiple' },
    selected: 'Selected',
    nothing: 'Nothing selected yet',
    hint: 'Try the keyboard: arrows, Home / End, Page Up / Down (+ Shift for years).',
    galleryTitle: 'One engine. Any face.',
    galleryLead:
      'These four pickers share the same hook and the same accessibility. Only the markup and CSS differ — which is the point of headless.',
    skins: {
      almanac: ['Almanac', 'Editorial serif, inline, single date.'],
      console: ['Console', 'Monospace markup, keyboard-first.'],
      hijri: [
        'Hijri field',
        'Arabic, RTL, Umm al-Qura with Gregorian beneath, text input + popup.',
      ],
      stay: ['Stay', 'Two months, range selection, nights counted, weekends priced.'],
    },
    fieldTitle: 'Ready-made field, still yours',
    fieldLead:
      'Optional <DateField> from dayfold/react/field. The icon can be any element, at the start or end of the input — or left out. These two fields are linked at runtime: picking a start date disables everything before it in the end field, and vice versa.',
    field: {
      position: 'Icon position',
      start: 'Start',
      end: 'End',
      icon: 'Icon',
      icons: {
        calendar: 'Calendar',
        range: 'Custom SVG',
        emoji: 'Emoji',
        text: 'Text',
        none: 'None',
      },
      pick: 'Pick',
      startLabel: 'Start date',
      endLabel: 'End date',
      startHint: 'Dates after the end date are disabled.',
      endHint: 'Dates before the start date are disabled.',
      endHintEmpty: 'Choose a start date first to limit this one.',
    },
    featuresTitle: 'Why dayfold',
    features: [
      [
        'Headless by design',
        'Prop getters for your elements. Tailwind, CSS modules, styled-components, plain CSS — nothing to override.',
      ],
      [
        'Accessible by default',
        'W3C APG grid pattern with real buttons in every cell, roving focus, live announcements, focus trap and RTL-aware arrows.',
      ],
      [
        'Every calendar, no tables',
        'Hijri Umm al-Qura, Persian, Hebrew, Buddhist… computed from the browser’s own Intl data, so they cost nothing extra.',
      ],
      [
        'Every string is yours',
        'Each aria-label, announcement and placeholder can be overridden per instance — Arabic ships built in.',
      ],
      [
        'Forms and SEO',
        'Hidden inputs for native form posts, <time datetime> props, SSR-safe ids and a fixed 6-week grid that never shifts layout.',
      ],
      [
        'Tiny and typed',
        'About 7 kB gzipped for the full picker, zero dependencies, tree-shakeable, strict TypeScript. Temporal and Date both accepted.',
      ],
    ],
    a11yTitle: 'Accessibility you can inspect — and edit',
    a11yLead:
      'Change any label below and watch what a screen reader would hear. dayfold exposes every string through one labels option.',
    a11yList: [
      'WCAG 2.2 AA target, verified with axe-core in CI',
      'Grid of real <button>s — disabled dates stay focusable and are announced as unavailable',
      'Arrow keys, Home/End, Page Up/Down, Shift+Page for years; arrows flip in RTL',
      'Dialog with focus trap, Escape to close, focus returned to the trigger',
      'Polite live region announces month and selection changes',
      'No colour-only state: every state is also a data attribute and in the label',
    ],
    lab: {
      prev: 'Previous-month label',
      next: 'Next-month label',
      selectedWord: 'Word for “selected”',
      todayWord: 'Word for “today”',
      hears: 'A screen reader hears',
      focusHint: 'Focus a day in the calendar to hear its label.',
      log: 'Live announcements',
    },
    sizeTitle: 'The whole picker weighs less than most calendars’ CSS',
    sizeLead:
      'Minified + gzipped JavaScript, measured with esbuild and Bundlephobia in September 2026. dayfold is headless, so it ships no CSS at all.',
    sizeNote: 'JS only. Styles for other libraries are extra.',
    codeTitle: 'Bring your own markup',
    install: 'Install',
    footer: 'MIT licensed. Built for every calendar.',
  },
  ar: {
    title: 'dayfold — منتقي تاريخ هجري وميلادي سهل الوصول لـ React وVue',
    description:
      'منتقي تاريخ خفيف (7 كيلوبايت) لـ React وVue وJavaScript: التقويم الهجري أم القرى، دعم RTL، سهولة الوصول WCAG 2.2، واختيار النطاق. بلا اعتماديات.',
    nav: {
      docs: 'التوثيق',
      gallery: 'المعرض',
      field: 'الحقل',
      a11y: 'سهولة الوصول',
      size: 'الحجم',
      lang: 'English',
    },
    eyebrow: 'منتقي تاريخ بلا واجهة · الإصدار 0.1',
    heroTitle: ['منتقي التاريخ', 'الذي ينطوي', 'داخل تصميمك.'],
    heroLead:
      'يتكفّل dayfold بالأجزاء الصعبة — حسابات التقويم والتنقل بلوحة المفاتيح وسمات ARIA وإدارة التركيز — ويترك لك الواجهة بالكامل. كل تقاويم Intl، ومنها الهجري، في نحو 7 كيلوبايت ودون اعتماديات.',
    copy: 'نسخ',
    copied: 'تم النسخ',
    readDocs: 'اقرأ التوثيق',
    controls: { calendar: 'التقويم', locale: 'اللغة', mode: 'نوع الاختيار', second: 'تقويم ثانٍ' },
    calendars: {
      gregory: 'ميلادي',
      'islamic-umalqura': 'هجري (أم القرى)',
      persian: 'فارسي',
      hebrew: 'عبري',
      buddhist: 'بوذي',
    } as Record<string, string>,
    none: 'بدون',
    modes: { single: 'تاريخ واحد', range: 'نطاق', multiple: 'متعدد' },
    selected: 'المحدد',
    nothing: 'لم يتم اختيار شيء بعد',
    hint: 'جرّب لوحة المفاتيح: الأسهم، Home وEnd، وPage Up وPage Down (مع Shift للسنوات).',
    galleryTitle: 'محرك واحد. بأي شكل.',
    galleryLead:
      'هذه المنتقيات الأربعة تستخدم الخطاف نفسه وسهولة الوصول نفسها. الاختلاف فقط في الترميز وCSS — وهذه فكرة المكونات بلا واجهة.',
    skins: {
      almanac: ['تقويم ورقي', 'خط تحريري، مضمّن، تاريخ واحد.'],
      console: ['الطرفية', 'ترميز بخط ثابت العرض، مصمم للوحة المفاتيح.'],
      hijri: [
        'حقل هجري',
        'عربي، من اليمين لليسار، أم القرى مع الميلادي أسفله، حقل نصي ونافذة منبثقة.',
      ],
      stay: ['الإقامة', 'شهران، اختيار نطاق، حساب الليالي، وتسعير عطلة نهاية الأسبوع.'],
    },
    fieldTitle: 'حقل جاهز، وما زال لك',
    fieldLead:
      'مكوّن ‎<DateField>‎ اختياري من dayfold/react/field. يمكن أن تكون الأيقونة أي عنصر، في بداية الحقل أو نهايته — أو بدونها. الحقلان مرتبطان أثناء التشغيل: اختيار تاريخ البداية يعطّل ما قبله في حقل النهاية، والعكس.',
    field: {
      position: 'موضع الأيقونة',
      start: 'البداية',
      end: 'النهاية',
      icon: 'الأيقونة',
      icons: {
        calendar: 'تقويم',
        range: 'SVG مخصص',
        emoji: 'رمز تعبيري',
        text: 'نص',
        none: 'بدون',
      },
      pick: 'اختر',
      startLabel: 'تاريخ البداية',
      endLabel: 'تاريخ النهاية',
      startHint: 'التواريخ بعد تاريخ النهاية معطّلة.',
      endHint: 'التواريخ قبل تاريخ البداية معطّلة.',
      endHintEmpty: 'اختر تاريخ البداية أولًا لتقييد هذا الحقل.',
    },
    featuresTitle: 'لماذا dayfold',
    features: [
      [
        'بلا واجهة جاهزة',
        'دوال خصائص تضعها على عناصرك. Tailwind أو CSS Modules أو CSS عادي — لا شيء تحتاج لتجاوزه.',
      ],
      [
        'سهل الوصول افتراضيًا',
        'نمط الشبكة من W3C مع أزرار حقيقية في كل خلية، وتركيز متنقل، وإعلانات حيّة، وحصر التركيز، وأسهم تراعي الاتجاه.',
      ],
      [
        'كل التقاويم بلا جداول',
        'الهجري أم القرى والفارسي والعبري والبوذي… تُحسب من بيانات Intl في المتصفح، فلا تضيف أي حجم.',
      ],
      [
        'كل النصوص قابلة للتعديل',
        'يمكن تخصيص كل aria-label وكل إعلان وكل نص توضيحي لكل مكوّن — والعربية مدمجة.',
      ],
      [
        'النماذج ومحركات البحث',
        'حقول مخفية لإرسال النماذج، وخصائص ‎<time datetime>‎، ومعرّفات آمنة للعرض من الخادم، وشبكة ثابتة من 6 أسابيع لا تزيح التخطيط.',
      ],
      [
        'صغير ومكتوب بـ TypeScript',
        'نحو 7 كيلوبايت مضغوطة للمنتقي الكامل، بلا اعتماديات، قابل للتقليم. يقبل Temporal وDate.',
      ],
    ],
    a11yTitle: 'سهولة وصول يمكنك فحصها — وتعديلها',
    a11yLead:
      'غيّر أي نص أدناه وشاهد ما سيسمعه مستخدم قارئ الشاشة. يعرض dayfold كل النصوص عبر خيار labels واحد.',
    a11yList: [
      'مستهدف WCAG 2.2 بمستوى AA، ومُتحقق منه عبر axe-core',
      'شبكة من أزرار حقيقية — التواريخ المعطلة تبقى قابلة للتركيز ويُعلن أنها غير متاحة',
      'الأسهم وHome وEnd وPage Up وPage Down، وShift للسنوات؛ الأسهم تنعكس في الاتجاه من اليمين لليسار',
      'نافذة حوار مع حصر التركيز، وEscape للإغلاق، وإعادة التركيز للزر',
      'منطقة إعلان حيّة تعلن تغيّر الشهر والاختيار',
      'لا حالة تعتمد على اللون وحده: كل حالة لها سمة data وتُذكر في التسمية',
    ],
    lab: {
      prev: 'تسمية الشهر السابق',
      next: 'تسمية الشهر التالي',
      selectedWord: 'كلمة «محدد»',
      todayWord: 'كلمة «اليوم»',
      hears: 'يسمع قارئ الشاشة',
      focusHint: 'ضع التركيز على يوم في التقويم لسماع تسميته.',
      log: 'الإعلانات الحيّة',
    },
    sizeTitle: 'المنتقي كاملًا أخف من ملف CSS لمعظم التقاويم',
    sizeLead:
      'حجم JavaScript بعد التصغير والضغط، مقاس عبر esbuild وBundlephobia في سبتمبر 2026. dayfold بلا واجهة، لذا لا يشحن أي CSS.',
    sizeNote: 'JavaScript فقط. أنماط المكتبات الأخرى إضافية.',
    codeTitle: 'استخدم ترميزك الخاص',
    install: 'التثبيت',
    footer: 'مرخّص بموجب MIT. مصمم لكل التقاويم.',
  },
}

export type Dict = (typeof t)['en']
