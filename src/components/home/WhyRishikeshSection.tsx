import { Container, Pill } from "@/components/ui";
import { WHY_RISHIKESH_VIDEO_URL } from "@/constants/rishikesh";
import {
	fetchYouTubeDuration,
	fetchYouTubeOEmbed,
	parseYouTubeId,
	youTubeWatchUrl,
} from "@/lib/youtube";

/*
 * Each passage is presented as a numbered "sutra" — giving the section
 * an editorial, manuscript-like feel unique to a yoga school.
 */
const SUTRAS = [
	{
		body: "There is a sacred rhythm in Rishikesh that cannot be explained but must be felt. It lives in the crispness of the morning air, hums in the silence between the ringing of temple bells, and moves rhythmically in the gentle flow of the river Ganga. For centuries, seekers from all over the world have come here in the drawing of something beyond words. To learn yoga in Rishikesh is to become part of that ancient stream of wisdom, healing, and inner peace.",
	},
	{
		body: "Yoga in India is another way of remembering who you truly are. Sitting here in the serene Himalayan foothills and being immersed in the spiritual undercurrent of this holy land, your yoga practice transcends the physical. The asanas start to stir something within; the breathing turns from unconscious to a prayer; the meditation deepens into stillness, as if the very mountains are meditating with you.",
	},
	{
		body: "The energy of this land holds the memory of sages who walked here before us — those silent saints who sat by the river and dissolved the limits between self and universe. When you sit beside the Ganga at sunrise or bring your voice in chanting, you find yourself feeling light, clear, and alive. It isn't a spell — it's presence, and Rishikesh can bring you home to it.",
	},
] as const;

const CLOSING_INVITATION =
	"So come… for we warmly invite you to experience it yourself. Walk with us on the banks of this sacred river. Breathe with the mountains. Let Rishikesh remind you of your wholeness, of your stillness, and the vast, beautiful peace that lies within you.";

function formatDuration(totalSeconds: number) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function buildEmbedUrl(videoId: string) {
	const params = new URLSearchParams({
		rel: "0",
		modestbranding: "1",
		playsinline: "1",
	});
	return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export default async function WhyRishikeshSection() {
	const videoId = parseYouTubeId(WHY_RISHIKESH_VIDEO_URL);
	if (!videoId) return null;

	const watchUrl = youTubeWatchUrl(videoId);
	const [oembed, durationSeconds] = await Promise.all([
		fetchYouTubeOEmbed(watchUrl),
		fetchYouTubeDuration(videoId),
	]);

	return (
		<section
			id="why-rishikesh"
			className="relative overflow-hidden bg-paper py-16 sm:py-20 md:py-24 lg:py-28"
		>
			<Container size="2xl">
				{/* ── Section Header ── */}
				<div className="mb-10 sm:mb-12 md:mb-14">
					<Pill>The Yoga Capital of the World</Pill>

					<h2 className="font-serif font-medium text-[1.625rem] leading-[1.12] sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-[1.08] text-ink mt-4 sm:mt-5 max-w-3xl text-balance">
						Why learn yoga in{" "}
						<span className="italic font-normal text-primary">Rishikesh</span>
						{" "}— where earth, sky, and spirit meet
					</h2>

					<p className="type-lead text-muted mt-3 sm:mt-4 max-w-2xl">
						For centuries, seekers have been drawn to this sacred land at the
						foothills of the Himalayas. Here, yoga is not just practised — it is
						lived, breathed, and remembered.
					</p>

					{/* Decorative rule */}
					<div
						className="mt-5 sm:mt-6 w-16 h-px bg-linear-to-r from-primary/40 to-transparent"
						aria-hidden="true"
					/>
				</div>

				{/* ── Two-column: Prose left + Sticky video right ── */}
				<div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-12 xl:gap-14 items-start">
					{/* Left — Numbered sutra passages */}
					<div className="space-y-8 sm:space-y-10">
						{SUTRAS.map((sutra, i) => (
							<article key={sutra.body.slice(0, 20)} className="relative">
								<div className="flex gap-4 sm:gap-5 items-start">
									{/* Large decorative number */}
									<span
										className="shrink-0 font-serif text-4xl sm:text-5xl md:text-6xl leading-none text-primary/10 select-none tabular-nums"
										aria-hidden="true"
									>
										{String(i + 1).padStart(2, "0")}
									</span>
									<div className="min-w-0 pt-1 sm:pt-2">
										<p className="type-body text-ink/80 leading-relaxed sm:leading-[1.75]">
											{sutra.body}
										</p>
									</div>
								</div>
								{/* Subtle divider between passages */}
								{i < SUTRAS.length - 1 && (
									<div
										className="mt-8 sm:mt-10 ml-14 sm:ml-16 md:ml-20 w-12 h-px bg-primary/15"
										aria-hidden="true"
									/>
								)}
							</article>
						))}

						{/* ── Closing Pull Quote ── */}
						<blockquote className="relative border-l-2 border-primary/25 pl-5 sm:pl-6 py-1">
							<p className="font-serif italic text-lg sm:text-xl md:text-[1.375rem] leading-[1.5] text-ink/65">
								{CLOSING_INVITATION}
							</p>
							<footer className="mt-3 sm:mt-4">
								<cite className="type-eyebrow text-primary not-italic">
									Nirvana Yoga School · Rishikesh
								</cite>
							</footer>
						</blockquote>
					</div>

					{/* Right — Sticky video + meta */}
					<div className="lg:sticky lg:top-24 space-y-4">
						{/* "Hear from our founder" label */}
						<div className="flex items-center gap-3">
							<span className="type-eyebrow text-primary whitespace-nowrap">
								Hear from our founder
							</span>
							<span
								className="h-px flex-1 bg-primary/15"
								aria-hidden="true"
							/>
						</div>

						{/* Video embed */}
						<div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-card ring-1 ring-ink/5 bg-ink/5">
							<div className="relative aspect-video w-full">
								<iframe
									src={buildEmbedUrl(videoId)}
									title={oembed.title}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									referrerPolicy="strict-origin-when-cross-origin"
									allowFullScreen
									className="absolute inset-0 h-full w-full border-0"
								/>
							</div>
						</div>

						{/* Video meta */}
						<div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-card">
							<p className="type-ui font-medium text-ink line-clamp-2">
								{oembed.title}
							</p>
							<div className="flex items-center justify-between gap-3 mt-2">
								<p className="type-eyebrow text-muted">
									Gurudev Dhruvaji · Nirvana Yoga School
								</p>
								<span className="shrink-0 inline-flex items-center gap-1.5 bg-primary/8 text-primary rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums">
									<span
										className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
										aria-hidden="true"
									/>
									{formatDuration(durationSeconds)}
								</span>
							</div>
						</div>

						{/* Quick facts card */}
						<div className="welcome-stats-strip rounded-xl sm:rounded-2xl text-white p-5 sm:p-6 relative overflow-hidden">
							<h3 className="type-eyebrow text-white/70 mb-3">
								Why Rishikesh?
							</h3>
							<ul className="space-y-2.5">
								{[
									"Birthplace of yoga — 5,000+ years of tradition",
									"Sacred Himalayan foothills by the river Ganga",
									"Globally recognised Yoga Capital of the World",
									"Energy of ancient sages, temples & ashrams",
								].map((item) => (
									<li
										key={item}
										className="flex items-start gap-2.5 text-sm text-white/85 leading-snug"
									>
										<span
											className="mt-1 w-1 h-1 rounded-full bg-accent shrink-0"
											aria-hidden="true"
										/>
										{item}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}