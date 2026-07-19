#!/usr/bin/env node
/**
 * Sync retreat schedules (and optional metadata) from the live site into
 * src/content/data/retreats/retreats.json
 */
import fs from "node:fs";
import path from "node:path";

const SLUGS = [
  "3-day-yoga-retreat-in-rishikesh-india",
  "5-day-yoga-retreat-in-rishikesh-india",
  "7-day-yoga-retreat-in-rishikesh-india",
];

const SITE = "https://www.nirvanayogaschoolindia.com";
const dataPath = path.join("src/content/data/retreats/retreats.json");

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function parseSchedule(html) {
  const items = [];
  const chunks = html.split(/<div class="accordion-item/);
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    const dayMatch = chunk.match(/Day\s*(\d+)/i);
    const titleMatch = chunk.match(/day-title">([^<]+)/i);
    const noteMatch = chunk.match(/Note:[^<]+/i);
    if (!dayMatch) continue;

    const activities = [];
    const rowRe =
      /<div class="day-time">([^<]*)<\/div>\s*<div class="day-content">([^<]*)<\/div>/gi;
    let row;
    row = rowRe.exec(chunk);
    while (row) {
      activities.push({
        time: decode(row[1]),
        activity: decode(row[2]),
      });
      row = rowRe.exec(chunk);
    }

    items.push({
      day: Number(dayMatch[1]),
      title: titleMatch ? decode(titleMatch[1]) : `Day ${dayMatch[1]}`,
      note: noteMatch ? decode(noteMatch[0]) : undefined,
      activities,
    });
  }
  return items;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  for (const slug of SLUGS) {
    const html = await (await fetch(`${SITE}/${slug}`)).text();
    const schedule = parseSchedule(html);
    const retreat = data.retreats.find((r) => r.slug === slug);
    if (!retreat) {
      console.warn(`skip missing slug: ${slug}`);
      continue;
    }

    retreat.schedule = schedule.map((day) => ({
      day: day.day,
      title: day.title,
      note: day.note,
      image:
        retreat.schedule?.find((entry) => entry.day === day.day)?.image ??
        retreat.schedule?.[day.day - 1]?.image,
      activities: day.activities,
    }));

    console.log(
      `${slug}: ${schedule.map((d) => `D${d.day}(${d.activities.length})`).join(", ")}`,
    );
  }

  fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log("Wrote", dataPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
