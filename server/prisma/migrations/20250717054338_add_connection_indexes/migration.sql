-- CreateIndex
CREATE INDEX "Connection_userAId_idx" ON "Connection"("userAId");

-- CreateIndex
CREATE INDEX "Connection_userBId_idx" ON "Connection"("userBId");

-- CreateIndex
CREATE INDEX "ConnectionRequest_senderId_idx" ON "ConnectionRequest"("senderId");

-- CreateIndex
CREATE INDEX "ConnectionRequest_receiverId_idx" ON "ConnectionRequest"("receiverId");
