import TeachersAdminClient from "./TeachersAdminClient";

/**
 * Admin: Teachers / faculty — editor matched to the public `/teacher` UI,
 * not the generic course module builder.
 */
export default function AdminTeachersSection() {
  return <TeachersAdminClient />;
}
