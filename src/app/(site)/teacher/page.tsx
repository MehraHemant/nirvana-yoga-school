import type { Metadata } from "next";
import { MapSection } from "@/components/home";
import TeachersPageClient from "@/components/teachers/TeachersPageClient";
import { getTeachers, getTeachersPageDocument } from "@/content/data/teachers";
import { courseMetadata } from "../_shared/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const page = getTeachersPageDocument();
  return courseMetadata(page.title, page.description, page.image);
}

export default function TeachersPage() {
  const page = getTeachersPageDocument();
  const teachers = getTeachers();

  return (
    <>
      <TeachersPageClient teachers={teachers} heroImage={page.image} />
      <MapSection />
    </>
  );
}
