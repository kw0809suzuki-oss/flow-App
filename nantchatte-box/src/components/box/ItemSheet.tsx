import { useEffect } from "react";
import { Trash2, X } from "lucide-react";
import type { BoxItem } from "@/lib/box-storage";
import { CATEGORY_META, formatDate } from "@/lib/classify";
import { CategoryChip } from "./CategoryChip";

interface ItemSheetProps {
  item: BoxItem;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function ItemSheet({ item, onClose, onDelete }: ItemSheetProps) {
  const meta = CATEGORY_META[item.category];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="投げ込んだものの詳細" className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="閉じる" onClick={onClose} className="animate-fade-in absolute inset-0 bg-foreground/40" />
      <div className="animate-sheet-up relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl">
        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
          <CategoryChip category={item.category} />
          <button type="button" onClick={onClose} aria-label="詳細を閉じる" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-sm text-muted-foreground">{meta.hint}</p>
          {item.image && <img src={item.image} alt="投げ込んだ写真" className="mt-3 w-full rounded-2xl border border-border object-cover" />}
          {item.text ? (
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-foreground">{item.text}</p>
          ) : (
            !item.image && <p className="mt-3 text-muted-foreground">（からっぽ）</p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">ポイした日時：{formatDate(item.createdAt)}</p>
        </div>
        <div className="border-t border-border px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button type="button" onClick={() => { onDelete(item.id); onClose(); }} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-destructive/10 font-bold text-destructive transition-transform active:scale-95">
            <Trash2 className="h-4 w-4" />
            これは捨てる
          </button>
        </div>
      </div>
    </div>
  );
}