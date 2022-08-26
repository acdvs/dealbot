-- CreateTable
CREATE TABLE "api_errors" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "path" VARCHAR(255) NOT NULL,

    CONSTRAINT "api_errors_pkey" PRIMARY KEY ("id")
);
