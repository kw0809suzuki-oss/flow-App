import type { BoxCategory } from "@/lib/box-storage";
import { CATEGORY_META } from "@/lib/classify";

const CHIP_CLASS: Record<BoxCategory, string> = {
  buy: "bg-cat-buy text-cat-buy-foreground",
  todo: "bg-cat-todo text-cat-todo-foreground",
  go: "bg-cat-go text-cat-go-foreground",
  curious: "bg-cat-curious text-cat-curious-foreground",
  record: "bg-cat-record text-cat-record-foreground",
  mystery: "bg-cat-mystery text-cat-mystery-foreground",
};

export function CategoryChip({ category }: { category: BoxCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${CHIP_CLASS[category]}`}>
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}