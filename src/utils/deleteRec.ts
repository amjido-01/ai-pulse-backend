import prisma from "../config/db" // Ensure you import your Prisma client

export async function deleteAllRecords() {
  try {
    // Delete all records from the "Aiproducts" table
    const deletedRecords = await prisma.aiproducts.deleteMany({});
    
    console.log(`Deleted ${deletedRecords.count} records from the Aiproducts table.`);
  } catch (error) {
    console.error("Error deleting records:", error);
  } finally {
    await prisma.$disconnect(); // Close the database connection
  }
}
