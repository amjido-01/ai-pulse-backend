import { Response } from "express";
import prisma from "../../config/db";
import axios from "axios";
import { categorizeProduct } from "../../api/categorizeProduct";
import cron from "node-cron";
import nodemailer from "nodemailer";

interface ProductNode {
  id: string;
  name: string;
  tagline: string;
  createdAt: string;
  url: string;
  website: string;
}

interface GraphQLResponse {
  data: {
    posts: {
      edges: {
        node: ProductNode;
      }[];
    };
  };
}

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email function
async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text: body,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
}

// Notify users based on interest
async function notifyUsersForNewProduct(productId: string, name: string, category: string, website: string): Promise<void> {
  try {
    const interestedUsers = await prisma.user.findMany({
      where: {
        interest: { some: { interest: category } },
      },
    });

    const notifications = interestedUsers.map((user) => ({
      userId: user.id,
      productName: name,
      productId,
      website,
      notificationTime: new Date(),
    }));

    if (notifications.length > 0) {
      await prisma.userNotifications.createMany({ data: notifications });
      console.log(`Notifications created for ${notifications.length} users for product "${name}"`);
    }
  } catch (error) {
    console.error("Error notifying users:", error);
  }
}

// Fetch and save AI products
export const fetchAndSaveAIProducts = async (res?: Response): Promise<void> => {
  try {
    const accessToken = process.env.PRODUCT_HUNT_ACCESS_TOKEN;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const isoString = todayStart.toISOString();

    const query = `
      {
        posts(postedAfter: "${isoString}") {
          edges {
            node {
              id
              name
              tagline
              createdAt
              url
              website
            }
          }
        }
      }
    `;

    const response = await axios.post<GraphQLResponse>(
      "https://api.producthunt.com/v2/api/graphql",
      { query },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const products = response.data.data.posts.edges;
    const keywords = ["ai", "machine learning", "artificial intelligence"];

    const aiProducts = products.filter((post) => {
      const name = post.node.name.toLowerCase();
      const tagline = post.node.tagline.toLowerCase();
      return keywords.some((keyword) => name.includes(keyword) || tagline.includes(keyword));
    });

    console.log(aiProducts, "prod")

    const savedProducts = await Promise.all(
      aiProducts.map(async (product) => {
        const existingProduct = await prisma.aiproducts.findUnique({
          where: { id: product.node.id },
        });

        if (!existingProduct) {
          const category = await categorizeProduct(product.node.tagline);

          const newProduct = await prisma.aiproducts.create({
            data: {
              id: product.node.id,
              name: product.node.name,
              tagline: product.node.tagline,
              createdAt: new Date(product.node.createdAt),
              url: product.node.url,
              website: product.node.website,
              category,
            },
          });

          await notifyUsersForNewProduct(newProduct.id, newProduct.name, category, newProduct.website);
          return newProduct;
        }

        return null;
      })
    );

    res?.status(200).json({
      message: "AI products fetched and saved successfully.",
      savedCount: savedProducts.filter(Boolean).length,
      savedProducts,
    });
  } catch (error) {
    console.error("Error fetching or saving AI products:", error);
    res?.status(500).json({ error: "Failed to fetch or save AI products." });
  }
};

// Send notifications
async function sendNotificationsBasedOnFrequency(frequency: string): Promise<void> {
  try {
    const now = new Date();
    const today = now.getDate();
    const dayOfWeek = now.getDay();

    const users = await prisma.user.findMany({
      where: {
        frequency,
        ...(frequency === "weekly" && {
          registeredAt: {
            gte: new Date(now.setDate(now.getDate() - dayOfWeek)), // Start of the week
            lte: new Date(now.setDate(now.getDate() - dayOfWeek + 6)), // End of the week
          },
        }),
        ...(frequency === "monthly" && {
          registeredAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1), // Start of the month
            lte: new Date(now.getFullYear(), now.getMonth() + 1, 0), // End of the month
          },
        }),
      },
      include: {
        notifications: { where: { sent: false },
        include: {
          product: true
        }
      },
      },
    });

    for (const user of users) {
      console.log(user.notifications)
      const emailBody = `
Hello ${user.name},

Here are the latest AI products that match your interests:

${user.notifications
  .map(
    (notification) => `
Product Name: ${notification.productName}
Website: ${notification.website}
Description: ${notification.product.tagline || "No description available."}
Learn more: ${notification.product.url || "No link available."}
`
  )
  .join("\n")}

Best regards,  
Your AI Notification App Team
`;

// Function to send the email
await sendEmail(user.email, "Your Latest AI Product Updates", emailBody);


      await prisma.userNotifications.updateMany({
        where: { userId: user.id, sent: false },
        data: { sent: true },
      });

      console.log(`Notifications sent to ${user.email}, ${emailBody}`);
    }
  } catch (error) {
    console.error(`Error sending notifications for ${frequency}:`, error);
  }
}

// CRON Jobs
//cron.schedule("0 8,16 * * *",async() => {
  //await fetchAndSaveAIProducts();
//});// Fetch products twice a day
// CRON Jobs
cron.schedule("0 9,19 * * *",async() => {
  await fetchAndSaveAIProducts();
});

cron.schedule("0 9,19 * * *", async () => {
  sendEmail("youndsadeeq10@gmail.com", "Your Latest AI Product Updates", "ye its time");
});


cron.schedule('2 10 * * *', () => { console.log("RUNNRS of Command running Nigerians!20200") })

cron.schedule("0 22 * * *", () => sendNotificationsBasedOnFrequency("daily")); // Daily notifications
cron.schedule("0 22 * * 0", () => sendNotificationsBasedOnFrequency("weekly")); // Weekly notifications (Sunday)
cron.schedule("0 22 1 * *", () => sendNotificationsBasedOnFrequency("monthly")); // Monthly notifications (1st day)


// // Fetch AI products twice a day
// cron.schedule("0 8,16 * * *", async () => {
//   console.log("Fetching AI products...");
//   fetchAndSaveAIProducts;
// });

// // Send daily notifications at 10:00 PM
// cron.schedule("0 22 * * *", async () => {
//   console.log("Sending daily notifications...");
//   const dailyUsers = await findUsersBasedOnFrequency("daily");
//   await sendNotificationsToUsers(dailyUsers);
// });

// // Send weekly notifications every day at 10:00 PM
// cron.schedule("0 22 * * *", async () => {
//   console.log("Sending weekly notifications...");
//   const dayOfWeek = new Date().getDay();
//   const weeklyUsers = await prisma.user.findMany({
//     where: { frequency: "weekly", registeredDay: dayOfWeek },
//   });
//   await sendNotificationsToUsers(weeklyUsers);
// });

// // Send monthly notifications every day at 10:00 PM
// cron.schedule("0 22 * * *", async () => {
//   console.log("Sending monthly notifications...");
//   const today = new Date().getDate();
//   const monthlyUsers = await prisma.user.findMany({
//     where: { frequency: "monthly", registeredDay: today },
//   });
//   await sendNotificationsToUsers(monthlyUsers);
// });
