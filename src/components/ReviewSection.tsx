import { useEffect, useState, useCallback } from "react";
import { Star, Loader2, ImagePlus, X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";

interface Review {
  id: string;
  product_handle: string;
  user_id: string;
  author_name: string;
  
  rating: number;
  title: string | null;
  body: string;
  media_urls: string[]; // storage paths
  created_at: string;
}

// Signed URL cache
const urlCache = new Map<string, string>();
async function getSignedUrl(path: string): Promise<string> {
  if (urlCache.has(path)) return urlCache.get(path)!;
  const { data } = await supabase.storage
    .from("review-media")
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  const url = data?.signedUrl ?? "";
  if (url) urlCache.set(path, url);
  return url;
}

function isVideo(path: string) {
  return /\.(mp4|webm|mov|m4v)$/i.test(path);
}

function Stars({ value, onChange, size = 18 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= value ? "fill-accent text-accent" : "text-muted-foreground/40"}
          />
        </button>
      ))}
    </div>
  );
}

function MediaThumb({ path, onOpen }: { path: string; onOpen: () => void }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    getSignedUrl(path).then(setUrl);
  }, [path]);
  if (!url) return <div className="h-20 w-20 bg-muted animate-pulse" />;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative h-20 w-20 overflow-hidden bg-muted border border-border/50 hover:border-accent transition-colors"
    >
      {isVideo(path) ? (
        <>
          <video src={url} className="h-full w-full object-cover" muted />
          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Play className="h-5 w-5 text-white fill-white" />
          </span>
        </>
      ) : (
        <img src={url} alt="Review media" className="h-full w-full object-cover" />
      )}
    </button>
  );
}

function MediaLightbox({
  paths,
  index,
  onClose,
  onIndex,
}: {
  paths: string[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const [url, setUrl] = useState<string>("");
  const path = paths[index];
  useEffect(() => {
    getSignedUrl(path).then(setUrl);
  }, [path]);

  const prev = useCallback(
    () => onIndex((index - 1 + paths.length) % paths.length),
    [index, paths.length, onIndex],
  );
  const next = useCallback(
    () => onIndex((index + 1) % paths.length),
    [index, paths.length, onIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
      {paths.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      <div className="max-h-full max-w-full flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        {url ? (
          isVideo(path) ? (
            <video key={path} src={url} className="max-h-[80vh] max-w-full" controls autoPlay />
          ) : (
            <img key={path} src={url} alt="" className="max-h-[80vh] max-w-full object-contain" />
          )
        ) : (
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        )}
        {paths.length > 1 && (
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            {index + 1} / {paths.length}
          </p>
        )}
      </div>
    </div>
  );
}


export function ReviewSection({ productHandle }: { productHandle: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState<{ paths: string[]; index: number } | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("reviews")
      .select("*")
      .eq("product_handle", productHandle)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error(error);
        setReviews((data as Review[]) ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productHandle]);

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const handleAdded = (r: Review) => {
    setReviews((cur) => [r, ...cur]);
    setShowForm(false);
  };

  return (
    <section className="mt-16 border-t border-border pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Customer Reviews</p>
          <div className="mt-3 flex items-center gap-3">
            <Stars value={Math.round(avg)} />
            <span className="text-sm text-muted-foreground">
              {reviews.length > 0
                ? `${avg.toFixed(1)} · ${reviews.length} review${reviews.length > 1 ? "s" : ""}`
                : "No reviews yet"}
            </span>
          </div>
        </div>
        {user ? (
          <Button
            onClick={() => setShowForm((v) => !v)}
            variant="outline"
            className="rounded-none uppercase tracking-[0.22em] text-xs border-accent/50 hover:bg-accent hover:text-accent-foreground"
          >
            {showForm ? "Cancel" : "Write a review"}
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            className="rounded-none uppercase tracking-[0.22em] text-xs"
          >
            <Link to="/">Sign in to review</Link>
          </Button>
        )}
      </div>

      {showForm && user && (
        <ReviewForm productHandle={productHandle} onAdded={handleAdded} />
      )}

      {loading ? (
        <div className="py-10 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Be the first to share your experience.
        </p>
      ) : (
        <ul className="mt-8 space-y-8">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-border/40 pb-8 last:border-0">
              <div className="flex items-center gap-3">
                <Stars value={r.rating} size={14} />
                {r.title && <p className="font-serif text-lg">{r.title}</p>}
              </div>
              <p className="mt-3 text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                {r.body}
              </p>
              {r.media_urls.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.media_urls.map((p, i) => (
                    <MediaThumb
                      key={p}
                      path={p}
                      onOpen={() => setLightbox({ paths: r.media_urls, index: i })}
                    />
                  ))}
                </div>
              )}
              <div className="mt-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="text-foreground">{r.author_name}</span>
                
                <span> · {new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {lightbox && (
        <MediaLightbox
          paths={lightbox.paths}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onIndex={(i) => setLightbox({ paths: lightbox.paths, index: i })}
        />
      )}
    </section>
  );
}

function ReviewForm({
  productHandle,
  onAdded,
}: {
  productHandle: string;
  onAdded: (r: Review) => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [name, setName] = useState(
    (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, 6);
    setFiles(next);
  };

  const submit = async () => {
    if (!user) return;
    if (!body.trim() || !name.trim()) {
      toast.error("Please fill in your name and review");
      return;
    }
    setSubmitting(true);
    try {
      const media_urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("review-media")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        media_urls.push(path);
      }
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          product_handle: productHandle,
          user_id: user.id,
          author_name: name.trim(),
          
          rating,
          title: title.trim() || null,
          body: body.trim(),
          media_urls,
        })
        .select()
        .single();
      if (error) throw error;
      toast.success("Review posted");
      onAdded(data as Review);
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border border-border/60 p-6 bg-card/40">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            className="mt-1 rounded-none"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Email (optional)</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
            className="mt-1 rounded-none"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Rating</label>
        <div className="mt-2">
          <Stars value={rating} onChange={setRating} size={22} />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Title (optional)</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="mt-1 rounded-none"
        />
      </div>

      <div className="mt-4">
        <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Your review</label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={5}
          className="mt-1 rounded-none"
        />
      </div>

      <div className="mt-4">
        <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Photos or videos (up to 6)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative h-20 w-20 bg-muted border border-border/50 overflow-hidden">
              {f.type.startsWith("video/") ? (
                <video src={URL.createObjectURL(f)} className="h-full w-full object-cover" muted />
              ) : (
                <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="absolute top-0.5 right-0.5 h-5 w-5 bg-black/70 text-white flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {files.length < 6 && (
            <label className="h-20 w-20 border border-dashed border-border/60 flex items-center justify-center cursor-pointer hover:border-accent transition-colors">
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>

      <Button
        onClick={submit}
        disabled={submitting}
        className="mt-6 rounded-none uppercase tracking-[0.22em] text-xs"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post review"}
      </Button>
    </div>
  );
}
