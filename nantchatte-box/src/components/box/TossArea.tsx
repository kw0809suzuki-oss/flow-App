import { useRef, useState } from "react";
import { Camera, Mic, MicOff, X } from "lucide-react";

interface TossAreaProps {
  onToss: (text: string, image: string | null) => void;
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 512;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas unsupported"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像を読み込めませんでした"));
    };
    img.src = url;
  });
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"] ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

export function TossArea({ onToss }: TossAreaProps) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [justTossed, setJustTossed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  const canToss = text.trim().length > 0 || image !== null;
  const speechSupported = typeof window !== "undefined" && getSpeechRecognition() !== null;

  const handleToss = () => {
    if (!canToss) return;
    onToss(text.trim(), image);
    setText("");
    setImage(null);
    setJustTossed(true);
    window.setTimeout(() => setJustTossed(false), 400);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      setImage(dataUrl);
    } catch {
      setVoiceNote("この画像は読み込めなかったみたい");
      window.setTimeout(() => setVoiceNote(null), 2500);
    }
  };

  const toggleVoice = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) return;
    const rec = new SR();
    rec.lang = "ja-JP";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript;
      if (transcript) setText((prev) => (prev ? prev + " " + transcript : transcript));
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <section aria-label="BOXへポイ" className={`rounded-3xl border-2 border-dashed border-primary/50 bg-card p-4 shadow-sm ${justTossed ? "animate-pop" : ""}`}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder={"なんでもここへ。\n「あの店また行きたい」「牛乳」とかでOK"}
        aria-label="投げ込むテキスト"
        className="w-full resize-none rounded-2xl bg-secondary/60 p-4 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/50"
      />
      {image && (
        <div className="relative mt-3 w-28">
          <img src={image} alt="添付した写真" className="h-28 w-28 rounded-2xl border border-border object-cover" />
          <button type="button" onClick={() => setImage(null)} aria-label="写真を取り消す" className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-foreground text-background shadow">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="mt-3 grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} aria-label="写真を添付" className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground transition-transform active:scale-90">
          <Camera className="h-5 w-5" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void handleFile(e.target.files?.[0]); e.target.value = ""; }} />
        {speechSupported ? (
          <button type="button" onClick={toggleVoice} aria-label={listening ? "音声入力を止める" : "声で入力する"} className={`grid h-12 w-12 place-items-center rounded-full transition-transform active:scale-90 ${listening ? "animate-wobble bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"}`}>
            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground/50"><Mic className="h-5 w-5" /></span>
        )}
        <button type="button" onClick={handleToss} disabled={!canToss} className="h-12 rounded-full bg-primary text-base font-bold text-primary-foreground shadow-md transition-all enabled:active:scale-95 disabled:opacity-40">
          BOXへポイ 📦
        </button>
      </div>
      <p className="mt-2 min-h-5 text-center text-xs text-muted-foreground" aria-live="polite">
        {listening ? "聞き取り中…そのまま話してね" : (voiceNote ?? "")}
      </p>
    </section>
  );
}
