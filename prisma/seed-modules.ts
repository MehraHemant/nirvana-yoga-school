/**
 * Rebuild `page_modules` JSON for all pages from static source files.
 * Run after `npm run db:seed` when you need to refresh module data only.
 */
import { seedPageModulesOnly } from "./seed-page-modules";

seedPageModulesOnly()
  .then(() => {
    console.log("Page modules seed complete.");
    process.exit(0);
  })
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
