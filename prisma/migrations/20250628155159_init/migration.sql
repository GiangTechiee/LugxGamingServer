-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'MOMO', 'ZALOPAY', 'VNPAY');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateTable
CREATE TABLE "Users" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100),
    "phone_number" VARCHAR(20),
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" VARCHAR(64),
    "verification_expires_at" TIMESTAMP(3),
    "reset_token" VARCHAR(64),
    "reset_expires_at" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "RefreshTokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Games" (
    "game_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "discount_price" DECIMAL(12,2),
    "developer" VARCHAR(100),
    "publisher" VARCHAR(100),
    "release_date" DATE,
    "is_hot" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Games_pkey" PRIMARY KEY ("game_id")
);

-- CreateTable
CREATE TABLE "Genres" (
    "genre_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,

    CONSTRAINT "Genres_pkey" PRIMARY KEY ("genre_id")
);

-- CreateTable
CREATE TABLE "Game_Genres" (
    "game_id" INTEGER NOT NULL,
    "genre_id" INTEGER NOT NULL,

    CONSTRAINT "Game_Genres_pkey" PRIMARY KEY ("game_id","genre_id")
);

-- CreateTable
CREATE TABLE "Platforms" (
    "platform_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,

    CONSTRAINT "Platforms_pkey" PRIMARY KEY ("platform_id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "order_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "discounted_amount" DECIMAL(12,2),
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "Order_Items" (
    "order_item_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,

    CONSTRAINT "Order_Items_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "cart_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("cart_id")
);

-- CreateTable
CREATE TABLE "Cart_Items" (
    "cart_item_id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,

    CONSTRAINT "Cart_Items_pkey" PRIMARY KEY ("cart_item_id")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "review_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "Promotions" (
    "promotion_id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(12,2) NOT NULL,
    "minimum_order" DECIMAL(12,0),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Promotions_pkey" PRIMARY KEY ("promotion_id")
);

-- CreateTable
CREATE TABLE "Game_Platforms" (
    "game_id" INTEGER NOT NULL,
    "platform_id" INTEGER NOT NULL,

    CONSTRAINT "Game_Platforms_pkey" PRIMARY KEY ("game_id","platform_id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "payment_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "transaction_id" VARCHAR(100),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_date" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "wishlist_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("wishlist_id")
);

-- CreateTable
CREATE TABLE "Game_Images" (
    "image_id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "alt_text" VARCHAR(255),
    "order_index" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_Images_pkey" PRIMARY KEY ("image_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_user_id_idx" ON "Users"("user_id");

-- CreateIndex
CREATE INDEX "Users_verification_token_idx" ON "Users"("verification_token");

-- CreateIndex
CREATE INDEX "Users_reset_token_idx" ON "Users"("reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_token_key" ON "RefreshTokens"("token");

-- CreateIndex
CREATE INDEX "RefreshTokens_user_id_idx" ON "RefreshTokens"("user_id");

-- CreateIndex
CREATE INDEX "Games_game_id_idx" ON "Games"("game_id");

-- CreateIndex
CREATE INDEX "Games_title_idx" ON "Games"("title");

-- CreateIndex
CREATE INDEX "Games_price_idx" ON "Games"("price");

-- CreateIndex
CREATE INDEX "Games_is_hot_idx" ON "Games"("is_hot");

-- CreateIndex
CREATE INDEX "Games_updated_at_idx" ON "Games"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "Genres_name_key" ON "Genres"("name");

-- CreateIndex
CREATE INDEX "Genres_genre_id_idx" ON "Genres"("genre_id");

-- CreateIndex
CREATE INDEX "Game_Genres_game_id_idx" ON "Game_Genres"("game_id");

-- CreateIndex
CREATE INDEX "Game_Genres_genre_id_idx" ON "Game_Genres"("genre_id");

-- CreateIndex
CREATE UNIQUE INDEX "Platforms_name_key" ON "Platforms"("name");

-- CreateIndex
CREATE INDEX "Platforms_platform_id_idx" ON "Platforms"("platform_id");

-- CreateIndex
CREATE INDEX "Orders_order_id_idx" ON "Orders"("order_id");

-- CreateIndex
CREATE INDEX "Orders_user_id_idx" ON "Orders"("user_id");

-- CreateIndex
CREATE INDEX "Orders_status_idx" ON "Orders"("status");

-- CreateIndex
CREATE INDEX "Orders_created_at_idx" ON "Orders"("created_at");

-- CreateIndex
CREATE INDEX "Order_Items_order_id_idx" ON "Order_Items"("order_id");

-- CreateIndex
CREATE INDEX "Order_Items_game_id_idx" ON "Order_Items"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_user_id_key" ON "Cart"("user_id");

-- CreateIndex
CREATE INDEX "Cart_cart_id_idx" ON "Cart"("cart_id");

-- CreateIndex
CREATE INDEX "Cart_user_id_idx" ON "Cart"("user_id");

-- CreateIndex
CREATE INDEX "Cart_Items_cart_id_idx" ON "Cart_Items"("cart_id");

-- CreateIndex
CREATE INDEX "Cart_Items_game_id_idx" ON "Cart_Items"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_Items_cart_id_game_id_key" ON "Cart_Items"("cart_id", "game_id");

-- CreateIndex
CREATE INDEX "Reviews_user_id_idx" ON "Reviews"("user_id");

-- CreateIndex
CREATE INDEX "Reviews_game_id_idx" ON "Reviews"("game_id");

-- CreateIndex
CREATE INDEX "Reviews_rating_idx" ON "Reviews"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_user_id_game_id_key" ON "Reviews"("user_id", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "Promotions_code_key" ON "Promotions"("code");

-- CreateIndex
CREATE INDEX "Game_Platforms_game_id_idx" ON "Game_Platforms"("game_id");

-- CreateIndex
CREATE INDEX "Game_Platforms_platform_id_idx" ON "Game_Platforms"("platform_id");

-- CreateIndex
CREATE INDEX "Payments_order_id_idx" ON "Payments"("order_id");

-- CreateIndex
CREATE INDEX "Wishlist_user_id_idx" ON "Wishlist"("user_id");

-- CreateIndex
CREATE INDEX "Wishlist_game_id_idx" ON "Wishlist"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_user_id_game_id_key" ON "Wishlist"("user_id", "game_id");

-- CreateIndex
CREATE INDEX "Game_Images_game_id_idx" ON "Game_Images"("game_id");

-- AddForeignKey
ALTER TABLE "RefreshTokens" ADD CONSTRAINT "RefreshTokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game_Genres" ADD CONSTRAINT "Game_Genres_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Games"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game_Genres" ADD CONSTRAINT "Game_Genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "Genres"("genre_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_Items" ADD CONSTRAINT "Order_Items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_Items" ADD CONSTRAINT "Order_Items_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Games"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart_Items" ADD CONSTRAINT "Cart_Items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("cart_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart_Items" ADD CONSTRAINT "Cart_Items_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Games"("game_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Games"("game_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game_Platforms" ADD CONSTRAINT "Game_Platforms_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Games"("game_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game_Platforms" ADD CONSTRAINT "Game_Platforms_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "Platforms"("platform_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Games"("game_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game_Images" ADD CONSTRAINT "Game_Images_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Games"("game_id") ON DELETE CASCADE ON UPDATE CASCADE;
