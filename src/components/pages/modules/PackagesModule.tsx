"use client";

import Image from "next/image";
import { Button, Container, SectionHeader } from "@/components/ui";
import type { SitePagePackage } from "@/data/sitePages";
import { sectionTone } from "../utils";

export default function PackagesModule({
  packages,
  ctaHref,
  toneIndex,
}: {
  packages: SitePagePackage[];
  ctaHref?: string;
  toneIndex: number;
}) {
  return (
    <section className={`${sectionTone(toneIndex)} py-16 sm:py-20`}>
      <Container size="2xl">
        <SectionHeader
          eyebrow="Packages"
          title={
            <>
              Retreat <span className="text-primary">pricing</span>
            </>
          }
          className="mb-10"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {packages.map((pkg) => (
            <article
              key={pkg.title}
              className="overflow-hidden rounded-3xl border border-ink/6 bg-white shadow-card"
            >
              {pkg.image && (
                <div className="relative aspect-[16/10] bg-sand">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6 sm:p-8">
                <h3 className="type-display-sm font-serif text-ink">
                  {pkg.title}
                </h3>
                <p className="mt-3 font-serif text-3xl text-primary">
                  {pkg.price}
                </p>
                {ctaHref && (
                  <Button
                    href={ctaHref}
                    variant="primary"
                    size="md"
                    className="mt-6"
                  >
                    Enquire Now
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
