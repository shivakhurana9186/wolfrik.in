import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Sparkles, Camera, Upload, Loader2, X, Download, Move, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function TryOnPanel({
  productImage,
  productTitle,
}: {
  productImage: string;
  productTitle: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="w-full mt-3 rounded-none uppercase tracking-[0.22em] text-xs border-accent/60 hover:bg-accent hover:text-accent-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 mr-2" />
          Live Try-On
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Live Try-On Mockup</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            See how <span className="text-foreground">{productTitle}</span> looks on you before
            you order. Your photo stays private.
          </p>
        </DialogHeader>
        <TryOnBody productImage={productImage} productTitle={productTitle} />
      </DialogContent>
    </Dialog>
  );
}

type Mode = "pick" | "overlay" | "ai";

function TryOnBody({
  productImage,
  productTitle,
}: {
  productImage: string;
  productTitle: string;
}) {
  const [mode, setMode] = useState<Mode>("pick");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setUserPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  if (!userPhoto) {
    return (
      <div className="mt-6">
        <div className="border border-dashed border-border/60 p-10 text-center">
          <Camera className="h-8 w-8 mx-auto text-accent" />
          <p className="mt-4 font-serif text-lg">We need a photo of you</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Full-body or upper-body works best. Your photo is only used to create the mockup
            — it is not saved on our servers.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => cameraRef.current?.click()}
              className="rounded-none uppercase tracking-[0.22em] text-xs"
            >
              <Camera className="h-3.5 w-3.5 mr-2" />
              Take photo
            </Button>
            <Button
              onClick={() => fileRef.current?.click()}
              variant="outline"
              className="rounded-none uppercase tracking-[0.22em] text-xs"
            >
              <Upload className="h-3.5 w-3.5 mr-2" />
              Upload photo
            </Button>
          </div>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </div>
    );
  }

  if (mode === "pick") {
    return (
      <div className="mt-6">
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setMode("overlay")}
            className="text-left border border-border/60 p-5 hover:border-accent transition-colors group"
          >
            <Move className="h-5 w-5 text-accent" />
            <p className="mt-3 font-serif text-lg">Instant Overlay</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Position and resize the garment on your photo yourself. Fast, no waiting.
            </p>
          </button>
          <button
            onClick={() => setMode("ai")}
            className="text-left border border-border/60 p-5 hover:border-accent transition-colors group"
          >
            <Sparkles className="h-5 w-5 text-accent" />
            <p className="mt-3 font-serif text-lg">AI Try-On</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              AI generates a realistic image of you actually wearing this piece. Takes ~20s.
            </p>
          </button>
        </div>
        <button
          onClick={() => setUserPhoto(null)}
          className="mt-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-accent"
        >
          Use a different photo
        </button>
      </div>
    );
  }

  if (mode === "overlay") {
    return (
      <OverlayEditor
        userPhoto={userPhoto}
        productImage={productImage}
        onBack={() => setMode("pick")}
      />
    );
  }

  return (
    <AiTryOn
      userPhoto={userPhoto}
      productImage={productImage}
      productTitle={productTitle}
      onBack={() => setMode("pick")}
    />
  );
}

function OverlayEditor({
  userPhoto,
  productImage,
  onBack,
}: {
  userPhoto: string;
  productImage: string;
  onBack: () => void;
}) {
  const [scale, setScale] = useState(0.5);
  const [pos, setPos] = useState({ x: 50, y: 55 }); // percent
  const [opacity, setOpacity] = useState(0.9);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setPos({
      x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)),
    });
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div className="mt-6">
      <div
        ref={containerRef}
        className="relative aspect-[3/4] bg-muted overflow-hidden select-none"
      >
        <img src={userPhoto} alt="You" className="h-full w-full object-cover" />
        <img
          src={productImage}
          alt=""
          draggable={false}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="absolute cursor-grab active:cursor-grabbing"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center",
            width: "60%",
            opacity,
            mixBlendMode: "multiply",
            filter: "contrast(1.05)",
          }}
        />
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
          <input
            type="range"
            min={0.2}
            max={1.2}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="flex-1 accent-[color:var(--accent)]"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground w-16">Blend</span>
          <input
            type="range"
            min={0.3}
            max={1}
            step={0.01}
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="flex-1 accent-[color:var(--accent)]"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <Button
          onClick={onBack}
          variant="ghost"
          className="rounded-none uppercase tracking-[0.22em] text-xs"
        >
          Back
        </Button>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground self-center">
          Drag the garment to reposition
        </p>
      </div>
    </div>
  );
}

function AiTryOn({
  userPhoto,
  productImage,
  productTitle,
  onBack,
}: {
  userPhoto: string;
  productImage: string;
  productTitle: string;
  onBack: () => void;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setImage(null);
    setIsFinal(false);
    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPhoto, productImage, productTitle }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`Try-on failed: ${res.status}`);
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      let sawFinal = false;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        const events = buf.split("\n\n");
        buf = events.pop() ?? "";
        for (const raw of events) {
          const lines = raw.split("\n");
          let eventName = "";
          let dataStr = "";
          for (const l of lines) {
            if (l.startsWith("event:")) eventName = l.slice(6).trim();
            else if (l.startsWith("data:")) dataStr += l.slice(5).trim();
          }
          if (!dataStr || dataStr === "[DONE]") continue;
          let payload: {
            type?: string;
            b64_json?: string;
            error?: { message?: string };
          };
          try {
            payload = JSON.parse(dataStr);
          } catch {
            continue;
          }
          if (eventName === "error" || payload.type === "error") {
            throw new Error(payload.error?.message || "Generation failed");
          }
          if (payload.b64_json) {
            const final = eventName === "image_generation.completed";
            flushSync(() => {
              setImage(`data:image/png;base64,${payload.b64_json}`);
              setIsFinal(final);
            });
            if (final) sawFinal = true;
          }
        }
      }
      if (!sawFinal) throw new Error("Stream ended without a final image");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {image ? (
          <img
            src={image}
            alt="AI try-on"
            className="h-full w-full object-cover transition-[filter] duration-500"
            style={{ filter: isFinal ? "none" : "blur(18px)" }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            {loading ? (
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin text-accent mx-auto" />
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Generating your look…
                </p>
              </div>
            ) : error ? (
              <div className="text-center px-6">
                <X className="h-6 w-6 mx-auto text-[color:var(--blood)]" />
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button
          onClick={onBack}
          variant="ghost"
          className="rounded-none uppercase tracking-[0.22em] text-xs"
        >
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={generate}
            variant="outline"
            disabled={loading}
            className="rounded-none uppercase tracking-[0.22em] text-xs"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Regenerate"}
          </Button>
          {image && isFinal && (
            <Button
              asChild
              className="rounded-none uppercase tracking-[0.22em] text-xs"
            >
              <a href={image} download={`wolfrik-tryon.png`}>
                <Download className="h-3.5 w-3.5 mr-2" />
                Save
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
