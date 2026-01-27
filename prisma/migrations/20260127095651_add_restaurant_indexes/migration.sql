-- CreateIndex
CREATE INDEX "MenuItem_restaurantId_idx" ON "MenuItem"("restaurantId");

-- CreateIndex
CREATE INDEX "Restaurant_name_idx" ON "Restaurant"("name");

-- CreateIndex
CREATE INDEX "Restaurant_createdAt_idx" ON "Restaurant"("createdAt");

-- CreateIndex
CREATE INDEX "Restaurant_name_createdAt_idx" ON "Restaurant"("name", "createdAt");
