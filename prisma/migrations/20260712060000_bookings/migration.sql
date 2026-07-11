-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('course', 'retreat');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending_payment', 'confirmed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('full', 'deposit_20');

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "type" "BookingType" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending_payment',
    "program_slug" TEXT NOT NULL,
    "program_title" TEXT NOT NULL,
    "room_type" TEXT NOT NULL,
    "batch_date" TEXT NOT NULL,
    "duration" TEXT,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT,
    "reference_code" TEXT,
    "hear_about" TEXT,
    "payment_mode" "PaymentMode" NOT NULL,
    "base_price_cents" INTEGER NOT NULL,
    "full_amount_cents" INTEGER NOT NULL,
    "pay_now_cents" INTEGER NOT NULL,
    "paypal_fee_cents" INTEGER NOT NULL,
    "total_pay_now_cents" INTEGER NOT NULL,
    "remaining_cents" INTEGER NOT NULL,
    "promo_code" TEXT,
    "discount_cents" INTEGER NOT NULL DEFAULT 0,
    "paypal_order_id" TEXT,
    "paypal_capture_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookings_type_status_created_at_idx" ON "bookings"("type", "status", "created_at");

-- CreateIndex
CREATE INDEX "bookings_deleted_at_idx" ON "bookings"("deleted_at");
