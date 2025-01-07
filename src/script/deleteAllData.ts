import prisma from "../config/db";

async function dropAllTables() {
  try {
    console.log("Dropping all tables...");
    await prisma.$executeRawUnsafe(`
      DO $$ DECLARE
        table_name TEXT;
      BEGIN
        FOR table_name IN
          (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS "' || table_name || '" CASCADE';
        END LOOP;
      END $$;
    `);
    console.log("All tables dropped successfully.");
  } catch (error) {
    console.error("Error dropping tables:", error);
  } finally {
    await prisma.$disconnect();
  }
}

dropAllTables();
