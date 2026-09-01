import type { BoxCategory } from "./box-storage";

export interface CategoryMeta {
  label: string;
  hint: string;
  emoji: string;
}

export const CATEGORY_META: Record<BoxCategory, CategoryMeta> = {
  buy: { label: "買うかも", hint: "なんか買いそうな気配がする", emoji: "🛒" },
  todo: { label: "やることっぽい", hint: "たぶん、いつかやるやつ", emoji: "📌" },
  go: { label: "行きたいっぽい", hint: "どこか行きたそう", emoji: "🚶" },
  curious: { label: "気になる", hint: "あとで見返したい系かも", emoji: "👀" },
  record: { label: "記録っぽい", hint: "思い出か記録っぽい", emoji: "📝" },
  mystery: { label: "なんか", hint: "よくわからんけど大事そう", emoji: "📦" },
};

const RULES: Array<{ category: BoxCategory; pattern: RegExp }> = [
  { category: "buy", pattern: /買|欲し|ほし|ポチ|円|価格|セール|amazon|アマゾン|楽天|カート|注文/i },
  { category: "todo", pattern: /やる|する|しなきゃ|忘れ|までに|締切|〆切|todo|タスク|予約|連絡|返信|送る|提出|掃除|払う|振込|手続き/i },
  { category: "go", pattern: /行きた|行く|旅行|駅|ランチ|カフェ|レストラン|店|住所|場所|公園|展覧会|ライブ|温泉|海|山|ディズニー/i },
  { category: "curious", pattern: /気になる|あとで|後で|読みた|見たい|観たい|記事|https?:\/\/|url|動画|本|映画|ドラマ|レシピ|チェック/i },
  { category: "record", pattern: /だった|でした|した。|今日|昨日|日記|メモ|覚え|夢|体重|体調|食べた|飲んだ|会った|記録/i },
];

export function classify(text: string, hasImage: boolean): BoxCategory {
  const t = text.trim();
  if (t) {
    for (const rule of RULES) {
      if (rule.pattern.test(t)) return rule.category;
    }
    return "mystery";
  }
  if (hasImage) return "record";
  return "mystery";
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${hh}:${mm}`;
}

export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "いまポイした";
  if (min < 60) return `${min}分前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}時間前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}日前`;
  return formatDate(ts);
}