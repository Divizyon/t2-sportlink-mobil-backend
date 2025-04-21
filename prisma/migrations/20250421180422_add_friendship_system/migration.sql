-- CreateTable
CREATE TABLE "friendship_request" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendship_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend" (
    "id" TEXT NOT NULL,
    "user_id1" TEXT NOT NULL,
    "user_id2" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "friendship_request_sender_id_receiver_id_key" ON "friendship_request"("sender_id", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "friend_user_id1_user_id2_key" ON "friend"("user_id1", "user_id2");

-- AddForeignKey
ALTER TABLE "friendship_request" ADD CONSTRAINT "friendship_request_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship_request" ADD CONSTRAINT "friendship_request_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_user_id1_fkey" FOREIGN KEY ("user_id1") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_user_id2_fkey" FOREIGN KEY ("user_id2") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
