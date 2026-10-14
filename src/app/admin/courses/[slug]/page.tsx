import { redirect } from "next/navigation";

type AdminCourseEditorRedirectProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Legacy course editor URL — unified under `/admin/pages/[slug]`.
 *
 * @param props - Route params with course slug
 */
export default async function AdminCourseEditorRedirect({
  params,
}: AdminCourseEditorRedirectProps) {
  const { slug } = await params;
  redirect(`/admin/pages/${decodeURIComponent(slug)}`);
}
