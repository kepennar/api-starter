# Migration `20201116174439-init`

This migration has been generated by Kevin Pennarun at 11/16/2020, 6:44:39 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "User" ADD COLUMN     "deleted" TIMESTAMP(3)
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20201116174439-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,20 @@
+// This is your Prisma schema file,
+// learn more about it in the docs: https://pris.ly/d/prisma-schema
+
+datasource db {
+  provider = "postgresql"
+  url = "***"
+}
+
+generator client {
+  provider = "prisma-client-js"
+}
+
+model User {
+  id       String    @id @default(uuid())
+  email    String    @unique
+  password String
+  name     String?
+  deleted  DateTime?
+
+}
```

