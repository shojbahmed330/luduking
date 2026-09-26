# Home Page UI উন্নয়ন — Dark Premium + Brand Header (পরিকল্পনা)

## লক্ষ্য
Home page (Dashboard) সহ header, tabs, bottom nav — সব মিলিয়ে একটা মোবাইল-ফ্রেন্ডলি, professional **Dark Premium** লুকে রূপান্তর। ব্যবহারকারীর পছন্দ অনুযায়ী:
- Header: Brand-rich (সোনালি Gold হেডার)
- লেবেল: English থাকবে
- প্রথম স্ক্রিন: সব Stats এক জায়গায় (grid)
- লুক: ডার্ক প্রিমিয়াম (গাঢ় ব্যাকগ্রাউন্ড, সোনালি হাইলাইট — Ludo King-এর মতো গেমি প্রিমিয়াম)

## এখন যা আছে (যাচাই করা)
- Header (`__root.tsx`): সাদা glass bar — 🎲 emoji + "Ludu Hisab" + ছোট auth chip। সাধারণ, brand-less।
- Home (`index.tsx`, ৭ ট্যাব): উপরে sticky Period selector + একটা Fund card, তারপর pill tabs (Overview/Matches/Stats/Money/Tea/Due/Insights)। Overview-তে কয়েকটা StatCard ছড়ানো।
- পুরো UI হালকা (light) থিম: সাদা কার্ড, ঘন ঘন `border-2 border-muted`, অনেক UPPERCASE `text-[8px]/[9px]` ছোট লেবেল, বেশি ইমোজি।
- BottomNavBar: সাদা glass, ৫টা আইটেম।
- Head meta-র description-এ ভুলে আটকে থাকা একটা কপি-পেস্ট টেক্সট আছে (`__root.tsx` + `index.tsx` head)।

## পরিকল্পনা

### ধাপ ১ — Dark Premium ডিজাইন টোকেন (ভিত্তি)
`src/styles.css`-এ থিম টোকেন ডার্কে যাবে:
- Background: গাঢ় নেভি-কালো সারফেস; Card: এক শেড হালকা উঁচু সারফেস; হায়ারার্কির জন্য ২–৩ লেভেলের surface + soft glow shadow।
- Gold (#F5B301) হবে প্রধান হাইলাইট/primary; Green/Blue/Red একটু উজ্জ্বল করে dark-এ পাঠযোগ্য (contrast) করা হবে।
- `theme-color` meta ডার্ক রঙে আপডেট, রুট html-এ ডার্ক থিম চালু।
- Light `.dark` ব্লক থাকবে, সব semantic token দিয়ে — কোনো হার্ডকোড রঙ কম্পোনেন্টে থাকবে না।

### ধাপ ২ — Brand-rich Header
- Gold গ্রেডিয়েন্ট হেডার ব্লক: ডাইস লোগো ব্যাজ, বড় অ্যাপ নাম, নিচে ছোট করে সেই মাসের সারসংক্ষেপ লাইন।
- ডানদিকে ইউজার chip আরও পরিপাটি (avatar + logout)।
- Safe-area ঠিক, sticky, scroll-এ সংকুচিত (compact) হবে — ছোট স্ক্রিনে জায়গা নষ্ট করবে না।

### ধাপ ৩ — প্রথম স্ক্রিনে সব Stats এক জায়গায় (Overview)
- Header-এর নিচেই একটা বড় Fund hero card (Current Fund Balance), তার ঠিক নিচে 2-কলাম grid-এ: Matches Played, Fines Collected, Cha-Nasta Expense, Cash in Hand, Total Due — এক নজরে সব সংখ্যা।
- Period selector একটা পরিপাটি pill/dropdown-এ যাবে, hero-র সাথে এক ব্লকে।
- Quick actions (New Match / New Expense) এক সারিতে বোল্ড বাটন হিসেবে।

### ধাপ ৪ — Tabs ও প্রতিটা ট্যাব রিস্টাইল
- Tab pill: dark surface + gold active glow; ৭টা ট্যাব ছোট স্ক্রিনে স্ক্রলযোগ্য থাকবে।
- সব কার্ড (matches list, leaderboard, money, tea, dues, insights) dark surface, বর্ডার হালকা, ছোট `text-[8px]` লেবেলগুলো বড় করে পড়ার উপযোগী করা, UPPERCASE overload কমানো, ইমোজি সীমিত ও অর্থবহ জায়গায়।
- চার্ট (recharts) dark-এ পাঠযোগ্য রঙ/গ্রিড।

### ধাপ ৫ — BottomNavBar ও বাকি পেজ সামঞ্জস্য
- Bottom nav: dark glass + gold active।
- `add-match`, `add-expense`, `add-payment`, `history`, `players`, AuthGuard/login — সব একই dark premium ভাষায় আনা হবে (একই কার্ড/ইনপুট/বাটন স্টাইল)।

### ধাপ ৬ — Head meta পরিষ্কার
- `__root.tsx` ও `index.tsx`-এর description/og:description-এ আটকে থাকা অর্থহীন কপি-পেস্ট টেক্সট সরিয়ে সঠিক বর্ণনা বসবে।

### ধাপ ৭ — প্রিভিউ যাচাই
- Playwright দিয়ে মোবাইল ভিউতে স্ক্রিনশট: header, overview grid, tabs, dark contrast ঠিক আছে কি না দেখা হবে।

## কী বদলাবে না
- কোনো business logic নয় — fine হিসাব, Due/Payment, Ranking (50% rule), Admin permission সব অপরিবর্তিত।
- কোনো নতুন ফিচার/টেবিল নয় — শুধু UI/UX।
- টেক্সট বা লেবেলের অর্থ বদলাবে না; English লেবেল থাকবে।

## কারিগরি নোট
- রঙ শুধু `src/styles.css`-এর semantic token-এ; কম্পোনেন্টে হার্ডকোড রঙ সরানো হবে যেখানে আছে।
- Baloo 2 ফন্ট ও Ludu ৪ রঙ অপরিবর্তিত থাকবে — শুধু প্রয়োগ dark-এ।
- বিল্ড ও typecheck যাচাই করে শেষ করা হবে।
