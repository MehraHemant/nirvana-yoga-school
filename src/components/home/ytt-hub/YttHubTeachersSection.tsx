import TeachersSection, {
  type TeacherProfile,
} from "@/components/home/TeachersSection";

type YttHubTeachersSectionProps = {
  teachers: TeacherProfile[];
};

/**
 * Hub teachers band — homepage TeachersSection inside hub padding wrapper.
 * Section `id` stays `teachers` for sticky nav (TeachersSection default).
 *
 * @param props - Faculty profiles from `getTeachersPage`
 */
export default function YttHubTeachersSection({
  teachers,
}: YttHubTeachersSectionProps) {
  if (teachers.length === 0) return null;

  return (
    <div className="ytt-hub-shared ytt-hub-teachers">
      <TeachersSection teachers={teachers} />
    </div>
  );
}
