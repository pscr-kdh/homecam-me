-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "refresh_token_expires_in" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "bio" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "Camera" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "camDevId" TEXT NOT NULL,
    "micDevId" TEXT,
    "isRecording" BOOLEAN NOT NULL,
    "motionEnabled" BOOLEAN NOT NULL,
    "soundType" TEXT NOT NULL,
    "trf" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CamOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cameraId" INTEGER NOT NULL,
    "trf" TEXT NOT NULL,
    CONSTRAINT "CamOption_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recordings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cameraId" INTEGER,
    "timeFrom" DATETIME NOT NULL,
    "timeUntil" DATETIME NOT NULL,
    "fileSizeinByte" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    CONSTRAINT "Recordings_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecConf" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cameraId" INTEGER NOT NULL,
    "unlimited" BOOLEAN NOT NULL DEFAULT true,
    "whenToRecord" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "RecConf_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
