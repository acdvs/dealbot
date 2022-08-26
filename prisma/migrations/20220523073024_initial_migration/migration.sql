-- CreateTable
CREATE TABLE "guilds" (
    "id" BIGINT NOT NULL,

    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ignored_sellers" (
    "guildId" BIGINT NOT NULL,
    "sellerId" VARCHAR(255) NOT NULL,

    CONSTRAINT "ignored_sellers_pkey" PRIMARY KEY ("guildId","sellerId")
);

-- CreateTable
CREATE TABLE "sellers" (
    "id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ignored_sellers" ADD CONSTRAINT "ignored_sellers_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ignored_sellers" ADD CONSTRAINT "ignored_sellers_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
