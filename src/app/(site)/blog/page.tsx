import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, SectionHeader } from "@/components/ui";
import { BLOG_POSTS } from "@/data/blogPosts";
import { ArrowRight } from "@/icons";

export const metadata: Metadata = {
  title: "Yoga Blog",
  description:
    "Yoga, Ayurveda, meditation, teacher training, and Rishikesh guides from Nirvana Yoga School.",
};

export default function BlogPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          className="absolute inset-0 bg-linear-to-br from-primary/30 via-ink to-secondary/30"
          aria-hidden="true"
        />
        <Container
          size="2xl"
          className="relative z-10 flex min-h-[48svh] items-end py-16 sm:py-20"
        >
          <div className="max-w-4xl">
            <p className="type-eyebrow mb-4 text-accent">Journal</p>
            <h1 className="type-h1 text-white">Yoga Blog</h1>
            <p className="type-lead mt-6 max-w-2xl font-sans leading-relaxed text-white/78">
              Practice notes, philosophy guides, wellness articles, and
              teacher-training resources from Nirvana Yoga School.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-28">
        <Container size="2xl">
          <SectionHeader
            eyebrow="Latest guides"
            title={
              <>
                Learn beyond <span className="text-primary">the mat</span>
              </>
            }
            description="Browse the live-site article library in the new Nirvana theme."
            align="center"
          />

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-3xl border border-ink/6 bg-white shadow-card transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-soft"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-ink/5">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <p className="type-eyebrow mb-3 text-primary">
                    {post.category}
                  </p>
                  <h2 className="type-display-sm font-serif text-ink transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-4 type-body font-sans leading-relaxed text-muted">
                    {post.excerpt}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-semibold text-primary">
                    Read article
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
