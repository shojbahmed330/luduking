# Player Ranking — Monthly Best Player System

## পদ্ধতি (User-approved)

### পয়েন্ট সিস্টেম

| Position | Points |
|----------|--------|
| 1st | 4 |
| 2nd | 3 |
| 3rd | 2 |
| 4th | 1 |

### Score

```
Score = মোট পয়েন্ট ÷ মোট ম্যাচ  (Average Points per Match)
```

- ম্যাচ-সংখ্যা-নিরপেক্ষ: কম ম্যাচ খেললেও ভালো খেললে best হতে পারবে।
- টাকা/fine দিয়ে নয় — শুধু পজিশনের পারফরম্যান্স দিয়ে ranking।

### মাসভিত্তিক রিসেট

- প্রতি মাসের ১ তারিখ থেকে পয়েন্ট হিসাব নতুন করে শুরু হবে।
- প্রতিটি মাসের জন্য আলাদা Best Player বের হবে।
- Dashboard-এর month filter যদি "All Time" হয় → সব ম্যাচের ranking; নির্দিষ্ট মাস সিলেক্ট করলে → সেই মাসের ranking।

### Minimum Match Rule

- Best Player ক্রাউন পেতে সেই মাসে কমপক্ষে **৩ ম্যাচ** খেলতে হবে।
- কম খেললে "⚠️ কম ম্যাচ" ব্যাজ দেখাবে, ক্রাউন পাবে না — কিন্তু তালিকায় থাকবে।

### Tie-breaker (সমান score হলে)

1. বেশি 1st place
2. বেশি ম্যাচ খেলেছে
3. কম 4th place

## UI — নতুন "Player Ranking" সেকশন (Insights ট্যাবের পরে)

- 🏆 **Best of the Month** কার্ড: নাম, avg points, মোট ম্যাচ, 1st/2nd/3rd/4th সংখ্যা।
- **Ranking তালিকা**: avg points অনুযায়ী sort — প্রতি প্লেয়ারের পাশে Rank #, Avg Pts, Matches, 1st/2nd/3rd/4th count।
- **"কিভাবে হিসাব হয়"** info বক্স: পয়েন্ট টেবিল (1st=4, 2nd=3, 3rd=2, 4th=1) ও Score ফর্মুলা ছোট করে দেখানো হবে, যেন সবাই বুঝতে পারে।
- Month filter-এর সাথে সংযুক্ত — মাস বদলালে ranking বদলাবে।

## Technical Details

- ডেটা ইতিমধ্যে আছে: `match_results` (position, player_id, match_id) + `matches` (match_date) — নতুন টেবিল/ডাটাবেস পরিবর্তন নেই।
- নতুন helper: `src/lib/ranking.ts` — `computeRanking(matchResults, matches, players)` রিটার্ন করবে per-player: matches, places[1..4], totalPoints, avgPoints, eligible (≥3 matches), rank।
- মাসভিত্তিক হিসাব filter-করা matchResults দিয়ে হবে (বর্তমান month filter পুনঃব্যবহার) — আলাদা কোনো stored monthly data লাগবে না, সব on-the-fly গণনা।
- UI: `src/routes/index.tsx` — Insights ট্যাবের পরে "Player Ranking" সেকশন।
- fine/টাকার হিসাব সম্পূর্ণ অছুতো থাকবে।
