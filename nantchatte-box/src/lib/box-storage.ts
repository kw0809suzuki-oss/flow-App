export type BoxCategory = "buy" | "todo" | "go" | "curious" | "record" | "mystery";

export interface BoxItem {
  id: string;
  text: string;
  image: string | null;
  createdAt: number;
  category: BoxCategory;
}

const KEY = "nanchatte-box-items-v1";
let saveTimer: number | null = null;
let pendingItems: BoxItem[] | null = null;

export function loadItems(): BoxItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BoxItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items: BoxItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // 保存容量超過などでも、画面操作そのものは止めない
  }
}

export function persistItemsLater(items: BoxItem[]) {
  pendingItems = items;
  if (saveTimer !== null) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    if (pendingItems) persist(pendingItems);
    pendingItems = null;
    saveTimer = null;
  }, 80);
}

export function addItemTo(items: BoxItem[], item: BoxItem): BoxItem[] {
  const next = [item, ...items];
  persistItemsLater(next);
  return next;
}

export function deleteItemFrom(items: BoxItem[], id: string): BoxItem[] {
  const next = items.filter((i) => i.id !== id);
  persistItemsLater(next);
  return next;
}
