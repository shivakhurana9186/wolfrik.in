import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Sparkles, Camera, Upload, Loader2, X, Download, Shirt, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PRODUCTS_QUERY,
  storefrontApiRequest,
  type ShopifyProduct,
} from "@/lib/shopify";
import { supabase } from "@/integrations/supabase/client";

type Role = "top" | "bottom" | "full";
type Garment = { image: string; title: string; role: Role };

function guessRole(title: string): Role {
  const t = title.toLowerCase();
  if (/(dress|jumpsuit|romper|gown|coord|set)/.test(t)) return "full";
  if (/(pant|trouser|jean|short|skirt|legging|cargo|chino|joggers?)/.test(t)) return "bottom";
  return "top";
}

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
          <DialogTitle className="font-serif text-2xl">Full-Look Try-On</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Upload your photo and pick a top and bottom. Our AI generates a photorealistic
            model mockup of you wearing the full outfit. Your photo stays private.
          </p>
        </DialogHeader>
        <TryOnBody productImage={productImage} productTitle={productTitle} />
      </DialogContent>
    </Dialog>
  );
}

function TryOnBody({
  productImage,
  productTitle,
}: {
  productImage: string;
  productTitle: string;
}) {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const initialRole = guessRole(productTitle);
  const [garments, setGarments] = useState<Garment[]>([
    { image: productImage, title: productTitle, role: initialRole },
  ]);
  const [started, setStarted] = useState(false);
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

  const setGarment = (role: Role, g: { image: string; title: string } | null) => {
    setGarments((prev) => {
      const others = prev.filter((x) => x.role !== role);
      if (!g) return others;
      return [...others, { ...g, role }];
    });
  };

  const hasTop = garments.some((g) => g.role === "top");
  const hasBottom = garments.some((g) => g.role === "bottom");
  const hasFull = garments.some((g) => g.role === "full");
  const canGenerate = userPhoto && (hasFull || hasTop || hasBottom);

  if (started && userPhoto) {
    return (
      <AiTryOn
        userPhoto={userPhoto}
        garments={garments}
        onBack={() => setStarted(false)}
      />
    );
  }

  return (
    <div className="mt-6 space-y-8">
      {/* Step 1: user photo */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-accent">Step 1</p>
        <p className="mt-1 font-serif text-lg">Your photo</p>
        {userPhoto ? (
          <div className="mt-3 flex items-center gap-4">
            <img src={userPhoto} alt="You" className="h-24 w-20 object-cover" />
            <Button
              variant="ghost"
              onClick={() => setUserPhoto(null)}
              className="rounded-none uppercase tracking-[0.22em] text-[10px]"
            >
              Change
            </Button>
          </div>
        ) : (
          <div className="mt-3 border border-dashed border-border/60 p-6 text-center">
            <Camera className="h-6 w-6 mx-auto text-accent" />
            <p className="mt-2 text-xs text-muted-foreground">
              Full-body works best. Not saved on our servers.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
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
                Upload
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
        )}
      </div>

      {/* Step 2: outfit */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-accent">Step 2</p>
        <p className="mt-1 font-serif text-lg">Build the outfit</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick a top and a bottom, or a full-body piece like a dress.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <GarmentSlot
            role="top"
            label="Top"
            selected={garments.find((g) => g.role === "top") ?? null}
            onSelect={(g) => setGarment("top", g)}
            disabled={hasFull}
          />
          <GarmentSlot
            role="bottom"
            label="Bottom"
            selected={garments.find((g) => g.role === "bottom") ?? null}
            onSelect={(g) => setGarment("bottom", g)}
            disabled={hasFull}
          />
        </div>

        <div className="mt-3">
          <GarmentSlot
            role="full"
            label="Or a full-body piece (dress / jumpsuit)"
            selected={garments.find((g) => g.role === "full") ?? null}
            onSelect={(g) => setGarment("full", g)}
            disabled={hasTop || hasBottom}
          />
        </div>
      </div>

      <Button
        disabled={!canGenerate}
        onClick={() => setStarted(true)}
        size="lg"
        className="w-full rounded-none uppercase tracking-[0.22em] text-xs"
      >
        <Sparkles className="h-3.5 w-3.5 mr-2" />
        Generate my model shot
      </Button>
    </div>
  );
}

function GarmentSlot({
  label,
  selected,
  onSelect,
  disabled,
}: {
  role: Role;
  label: string;
  selected: { image: string; title: string } | null;
  onSelect: (g: { image: string; title: string } | null) => void;
  disabled?: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setPickerOpen(true)}
        className={`w-full border p-3 flex items-center gap-3 text-left transition-colors ${
          selected ? "border-accent" : "border-border hover:border-accent"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <div className="h-14 w-14 bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {selected ? (
            <img src={selected.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <Shirt className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </p>
          <p className="text-xs truncate">
            {selected ? selected.title : "Choose piece"}
          </p>
        </div>
        {selected && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
            }}
            className="text-muted-foreground hover:text-accent"
          >
            <X className="h-4 w-4" />
          </span>
        )}
      </button>

      <GarmentPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={(g) => {
          onSelect(g);
          setPickerOpen(false);
        }}
        title={`Pick a ${label.toLowerCase()}`}
      />
    </div>
  );
}

function GarmentPicker({
  open,
  onOpenChange,
  onPick,
  title,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPick: (g: { image: string; title: string }) => void;
  title: string;
}) {
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);

  useEffect(() => {
    if (!open || products !== null) return;
    storefrontApiRequest(PRODUCTS_QUERY, { first: 40, query: null })
      .then((data) => setProducts(data?.data?.products?.edges ?? []))
      .catch(() => setProducts([]));
  }, [open, products]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
        </DialogHeader>
        {products === null ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No products available.
          </p>
        ) : (
          <div className="mt-2 grid grid-cols-3 gap-3">
            {products.map((p) => {
              const img = p.node.images.edges[0]?.node.url;
              if (!img) return null;
              return (
                <button
                  key={p.node.id}
                  onClick={() => onPick({ image: img, title: p.node.title })}
                  className="text-left group"
                >
                  <div className="aspect-[3/4] bg-muted overflow-hidden">
                    <img
                      src={img}
                      alt={p.node.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="mt-2 text-xs truncate">{p.node.title}</p>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AiTryOn({
  userPhoto,
  garments,
  onBack,
}: {
  userPhoto: string;
  garments: Garment[];
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
        body: JSON.stringify({ userPhoto, garments }),
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
      <div className="flex flex-wrap gap-2 mb-3">
        {garments.map((g) => (
          <span
            key={g.role}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground border border-border px-2 py-1"
          >
            <Check className="h-3 w-3 text-accent" />
            {g.role}: {g.title}
          </span>
        ))}
      </div>
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
                  Styling your look…
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
