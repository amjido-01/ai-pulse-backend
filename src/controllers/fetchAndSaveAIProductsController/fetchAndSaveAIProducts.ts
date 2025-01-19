import { Request, Response } from "express";
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

interface Notification {
  id: number;
  productId: string;
  userId: string;
  notificationTime: Date;
  sent: boolean;
}

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
});


// send mail
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

// creating notification
async function notifyUsersForNewProduct(productId: string, name: string, category: string, website: string): Promise<void> {
  try {
    const interestedUsers = await prisma.user.findMany({
      where: {
        AND: [
          { registeredAt: { lte: new Date() } },
          {
            interest: {
              some: {
                interest: category,
              },
            },
          },
        ],
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

// sending notification
async function sendNotificationsToUsers(users: any[]): Promise<void> {
  try {
    for (const user of users) {
      const emailContent = await Promise.all(
        user.notifications.map(async (notification: Notification) => {
          const product = await prisma.aiproducts.findUnique({
            where: { id: notification.productId },
          });

          if (product) {
            await prisma.userNotifications.update({
              where: { id: notification.id },
              data: { sent: true },
            });

            return `
              Product Name: ${product.name}
              Website: ${product.website}
              Description: ${product.tagline}
              Learn more: ${product.url}
            `;
          }

          return null;
        })
      );

      const emailBody = `
        Hello ${user.name},

        Here are the latest AI products that match your interests:

        ${emailContent.filter(Boolean).join("\n\n")}

        Best regards,
        Your AI Notification App Team
      `;

      await sendEmail(user.email, "Your Latest AI Product Updates", emailBody);
      console.log(`Email sent to ${user.email}:\n${emailBody}`);
      // Add email sending logic here (e.g., using Nodemailer or a third-party service).
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
}

// finding user based on frequency
async function findUsersBasedOnFrequency(frequency: string) {
  try {
    const users = await prisma.user.findMany({
      where: {
        frequency,
        notifications: {
          some: { sent: false },
        },
      },
      include: {
        notifications: {
          where: {sent: false},
        },
      },
    });

    await sendNotificationsToUsers(users);
  } catch (error) {
    console.error(`Error finding users for frequency "${frequency}":`, error);
  }
}

// fetching product
export const fetchAndSaveAIProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const accessToken = process.env.PRODUCT_HUNT_ACCESS_TOKEN;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const isoString = todayStart.toISOString();
    
    // const yesterdayStart = new Date();
    // yesterdayStart.setDate(yesterdayStart.getDate() - 1); // Subtract one day
    // yesterdayStart.setHours(0, 0, 0, 0); // Set to the start of the day
    // const isoStringYesterday = yesterdayStart.toISOString();

    // console.log(isoStringYesterday);


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

    const response = await axios.post<GraphQLResponse>("https://api.producthunt.com/v2/api/graphql", {
      query,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const products = response.data.data.posts.edges;
    console.log(products)
    const keywords = ["ai", "machine learning", "artificial intelligence"];

    const aiProducts = products.filter((post) => {
      const name = post.node.name.toLowerCase();
      const tagline = post.node.tagline.toLowerCase();
      return keywords.some((keyword) => name.includes(keyword) || tagline.includes(keyword));
    });

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

          await notifyUsersForNewProduct(newProduct.id, newProduct.name, newProduct.website, category);
          return newProduct;
        }

        return null;
      })
    );

    res.status(200).json({
      message: "AI products fetched and saved successfully.",
      savedCount: savedProducts.filter(Boolean).length,
      savedProducts,
    });
  } catch (error) {
    console.error("Error fetching or saving AI products:", error);
    res.status(500).json({ error: "Failed to fetch or save AI products." });
  }
};

cron.schedule("* * * * *", async () => {
  console.log("Running daily notifications task...");
  await findUsersBasedOnFrequency("daily");
});

cron.schedule("0 9 * * 1", async () => {
  console.log("Running weekly notifications task...");
  await findUsersBasedOnFrequency("weekly");
});

cron.schedule("0 9 1 * *", async () => {
  console.log("Running monthly notifications task...");
  await findUsersBasedOnFrequency("monthly");
});
