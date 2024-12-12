-- Alter Subscription Table to Allow Nullable userId
ALTER TABLE "Subscription" ALTER COLUMN "userId" DROP NOT NULL;
