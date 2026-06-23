export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  content: string[];
};

export const JOURNAL: JournalPost[] = [
  {
    slug: "wild-by-nature",
    title: "Wild by Nature, Refined by Choice",
    excerpt:
      "The story behind WOLFRIK CO. — why we believe restraint is the loudest form of luxury.",
    date: "2025-01-12",
    readTime: "4 min",
    category: "Manifesto",
    content: [
      "WOLFRIK was never meant to shout. We started this house with one question: what does it look like when the wild is dressed without being tamed?",
      "Every cut, every weight of fabric, every stitch is the answer. Dark palettes, gold restraint, blood-red flashes — chosen, not loud.",
      "We design for the people who don't need a logo to know who they are. The Alpha line carries the weight of intention; the Luna line moves with quiet command.",
      "This is the journal. We'll share the why behind the work — fabric sourcing, the cities that shape the collection, the rituals of a brand built slowly.",
    ],
  },
  {
    slug: "the-alpha-edit",
    title: "The Alpha Edit — Five Essentials",
    excerpt:
      "Five pieces that define the men's collection — built to outlast trends and earn their place in the rotation.",
    date: "2025-01-20",
    readTime: "6 min",
    category: "Edit",
    content: [
      "A wardrobe should be a small set of decisions you don't regret. Here are five from the Alpha line that we wear ourselves.",
      "1. The Selvedge Denim — Japanese mill, raw, cut straight. It earns its character. Don't wash it for the first three months.",
      "2. The Cashmere Crewneck — Mongolian fiber, weighted for layering. Equal parts soft and structured.",
      "3. The Pleated Wool Trouser — A sharper silhouette than streetwear usually allows. Pair with the crewneck for the easiest 'thought-through' look you'll own.",
      "4. The Oversized Tee — Heavyweight cotton, boxy fit. The piece that makes everything else read intentional.",
      "5. The Wide-Leg Drawstring Pant — Loungewear that doesn't apologize for being worn out of the house.",
    ],
  },
  {
    slug: "fabric-as-philosophy",
    title: "Fabric as Philosophy",
    excerpt:
      "Why we obsess over weight, weave, and finish — and what to look for the next time you touch a garment.",
    date: "2025-02-03",
    readTime: "5 min",
    category: "Craft",
    content: [
      "Most people judge a garment by its silhouette. We judge it by the hand — the weight of the fabric between your fingers, how it falls, how it returns.",
      "A heavyweight cotton tee tells you something a 130gsm fast-fashion tee never can. It tells you someone cared about how it would feel after fifty washes, not fifty Instagram posts.",
      "Look for: density (hold it up to light — less light through is usually better), recovery (does it bounce back from a stretch?), and finish (does it feel washed or chemical?).",
      "WOLFRIK fabrics are chosen for one reason: they get better with time. That's the only luxury that matters.",
    ],
  },
];

export function getPost(slug: string) {
  return JOURNAL.find((p) => p.slug === slug);
}
