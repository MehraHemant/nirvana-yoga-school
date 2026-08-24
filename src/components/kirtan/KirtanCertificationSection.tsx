"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container, SectionHeader } from "@/components/ui";
import { Certificate } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type KirtanCertificationSectionProps = {
  /** Certificate description copy */
  description: string;
  /** Optional training photos from the site page */
  images?: string[];
};

/**
 * Lightweight certification block for the 5-day kirtan music training.
 *
 * @param props - Section copy and optional image strip
 */
export default function KirtanCertificationSection({
  description,
  images = [],
}: KirtanCertificationSectionProps) {
  return (
    <section id="certification" className="bg-white py-20 sm:py-28">
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="surface-card mx-auto max-w-3xl rounded-3xl p-8 text-center sm:p-12"
        >
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Certificate size={28} />
          </div>
          <SectionHeader
            eyebrow="Exam & Certification"
            title={
              <>
                Certificate of <span className="text-primary">Completion</span>
              </>
            }
            align="center"
          />
          <p className="type-lead mx-auto mt-6 max-w-2xl leading-relaxed text-ink">
            {description}
          </p>

          {images.length > 0 && (
            <div className="mt-8 grid grid-cols-3 gap-3">
              {images.map((src, index) => (
                <div
                  key={src}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={src}
                    alt={`Kirtan training session ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 30vw, 200px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
