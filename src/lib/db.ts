import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Shared Prisma client singleton for server-side CMS and chatbot queries.
 * Do not import this module from Edge middleware.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Whether MySQL CMS is enabled via `DATABASE_URL`.
 */
export function isDbEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/**
 * Whether the generated Prisma client includes chatbot tables.
 */
export function isChatbotSchemaReady(): boolean {
  const client = prisma as unknown as Record<string, unknown>;
  return (
    typeof client.conversation === "object" &&
    typeof client.message === "object" &&
    typeof client.document === "object"
  );
}

/**
 * True when Prisma cannot reach the database or schema is not migrated (build/CI).
 *
 * @param error - Caught repository error
 */
export function isDbConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  if (
    error.name === "PrismaClientInitializationError" ||
    error.message.includes("Can't reach database server")
  ) {
    return true;
  }

  if (error.name === "PrismaClientKnownRequestError") {
    const code = (error as Error & { code?: string }).code;
    return code === "P2021" || code === "P2022";
  }

  return false;
}
