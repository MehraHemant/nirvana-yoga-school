export default function Card() {
  return (
    <section className="bg-light px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="relative">
          <div className="rounded-3xl p-8 pb-28 md:p-12 md:pb-28 lg:p-16 lg:pb-28 bg-primary">
            <h2 className="max-w-3xl text-2xl font-bold leading-tight text-accent md:text-4xl lg:text-5xl">
              Expanding Yoga&apos;s Reach,{" "}
              <span className="text-accent">Together</span>
            </h2>

            <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-white/85 md:mt-8 md:space-y-6 md:text-lg">
              <p>
                Yoga has the power to heal, uplift, and unite communities. But
                not everyone has access to its benefits.
              </p>
              <p>
                At Yoga Alliance, we work alongside teachers, organizations, and
                advocates to bring yoga to more people&mdash;wherever they are,
                in whatever circumstances. From refugee support programs to
                school-based wellness initiatives, we partner with those already
                making a difference to help amplify their impact.
              </p>
              <p>
                By supporting this work, you help ensure that yoga reaches more
                communities as a tool for well-being, resilience, and
                connection.
              </p>
            </div>
            <div className="cta-notch">
              Click here to learn more, you can view more by clicking here
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
