# Best Player Ranking — Accurate Method

## সমস্যা (Problem)

- বেশি ম্যাচ খেলেছে বলে বেশি টাকা দিয়েছে — এর মানে সে খারাপ প্লেয়ার না।
- কম ম্যাচ খেলেছে বলে কম টাকা দিয়েছে — এর মানে সে ভালো প্লেয়ারও না।
- তাই টাকা (fine) দিয়ে best player বের করা সম্ভব না। Best player বের করতে হবে **পজিশনের পারফরম্যান্স** দিয়ে — 1st, 2nd, 3rd, 4th — যা ম্যাচ সংখ্যার ওপর নির্ভরশীল নয়।

## যে পদ্ধতিগুলো কাজ করবে না (Reject)

1. **Total fine কম = best** ❌ — কম ম্যাচ খেললে কম fine, ভুল র‍্যাংকিং।
2. **Total 1st place বেশি = best** ❌ — বেশি ম্যাচ খেললে বেশি 1st হওয়া স্বাভাবিক।
3. **Win rate (%) শুধু** ⚠️ — ১ ম্যাচ খেলে জিতলে 100% win rate, যা ৩০ ম্যাচে ৫০% জেতার চেয়ে "best" হয়ে যায় — এটাও ভুল।

## সঠিক পদ্ধতি: Weighted Points + Minimum Matches

### ধাপ ১ — প্রতি ম্যাচে পয়েন্ট (Position Points)

প্রতিটি ম্যাচে পজিশন অনুযায়ী পয়েন্ট:

| Position | Points |
|----------|--------|
| 1st | 10 |
| 2nd | 6 |
| 3rd | 2 |
| 4th | 0 |

(ম্যাচে ৩ জন থাকলে: 1st = 10, 2nd = 6, 3rd = 2।)

### ধাপ ২ — Average Points per Match (মূল মেট্রিক)

```
Score = মোট পয়েন্ট ÷ মোট ম্যাচ
```

- এটি ম্যাচ-সংখ্যা-নিরপেক্ষ: ৫ ম্যাচে ৫০ পয়েন্ট (avg 10) = ৫০ ম্যাচে ৫০০ পয়েন্ট (avg 10) — সমান।
- কম ম্যাচ খেললেও ভালো খেললে best হতে পারবে।

### ধাপ ৩ — Minimum Match Requirement (বিশ্বাসযোগ্যতার জন্য)

- Best Player খেতাব পেতে হলে **কমপক্ষে X ম্যাচ** খেলতে হবে (যেমন মোট ম্যাচের ২০% বা ন্যূনতম ৫ ম্যাচ — ব্যবহারকারী সেট করতে পারবে)।
- এর কম খেললে দেখানো হবে "Not enough matches" ব্যাজ সহ, কিন্তু leaderboard থেকে বাদ যাবে না — শুধু "Best Player" ক্রাউন পাবে না।

### ধাপ ৪ — Tie-breaker (সমান score হলে)

1. বেশি 1st place
2. বেশি ম্যাচ খেলেছে (consistency)
3. কম 4th place

## বিকল্প সহজ পদ্ধতি (Alternative)

**Average Placement** = (সব পজিশনের যোগফল ÷ ম্যাচ সংখ্যা) — কম হলে best।
- সহজ বুঝতে, কিন্তু 1st জেতার মর্যাদা কম দেয় (1st vs 2nd এর পার্থক্য = 2nd vs 3rd এর পার্থক্য)।
- Weighted points-ই বেশি ন্যায্য, কারণ champion-কে বেশি ক্রেডিট দেয়।

## UI তে কী দেখাবে (Insights ট্যাবে নতুন "Best Player" সেকশন)

- 🏆 Best Player কার্ড: নাম, avg points/match, মোট ম্যাচ, 1st/2nd/3rd/4th সংখ্যা।
- সম্পূর্ণ ranking তালিকা avg points অনুযায়ী sort করা।
- প্রতি প্লেয়ারের পাশে: Avg Pts, Matches, Wins, Win Rate।
- Minimum match পূরণ করেনি এমন প্লেয়ারদের "⚠️ কম ম্যাচ" ব্যাজ।
- বর্তমান month/date filter এর সাথে সংযুক্ত — নির্দিষ্ট সময়ের best player-ও দেখা যাবে।

## Technical Details

- ডেটা ইতিমধ্যে আছে: `match_results` (position, player_id, match_id) — নতুন টেবিল লাগবে না।
- নতুন helper: `src/lib/best-player.ts` — `computeBestPlayer(matchResults, players)` রিটার্ন করবে per-player: matches, wins, places[1..4], totalPoints, avgPoints, eligible (min matches)।
- UI: `src/routes/index.tsx` এর Insights ট্যাবে নতুন সেকশন; filter-এর matchResults ব্যবহার করবে (Head-to-Head এর মতো)।
- কোনো ডাটাবেস পরিবর্তন নেই, কোনো fine/টাকার হিসাব স্পর্শ করবে না।
