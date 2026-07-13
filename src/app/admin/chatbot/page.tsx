import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/cms/auth";

/**
 * Admin chatbot panel placeholder while chatbot modules are restored.
 */
export default async function ChatbotAdminPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div>
      <h1 className="admin-title">AI Chatbot</h1>
      <p className="admin-subtitle">
        Chatbot document management will appear here. Core CMS admin is
        available from the sidebar.
      </p>
      <div className="admin-card">
        <p className="admin-hint">
          If you just restarted after the Edge middleware fix, other admin pages
          (Pages, Courses, Leads, Media) should work normally.
        </p>
      </div>
    </div>
  );
}
