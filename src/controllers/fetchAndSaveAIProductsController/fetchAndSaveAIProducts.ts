import { Request, Response } from "express";
import prisma from "../../config/db";
import axios from "axios";
import { categorizeProduct } from "../../api/categorizeProduct";
import cron from "node-cron"



interface ProductNode {
  id: string
  name: string;
  tagline: string;
  createdAt: string;
  url: string;
  website: string
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


async function notifyUsersForNewProduct(productId: string, category: string): Promise<void> {
  try {
    console.log("am in")
    // Find users with matching interests
    const interestedUsers = await prisma.user.findMany({
      where: {
        AND: [
          { registeredAt: { lte: new Date() } }, // Only notify users registered before or at product creation
          {
            interest: {
              some: {
                interest: category, // Match user interests
              },
            },
          },
        ],
      },
    });

    // Create notifications for matching users
    const notifications = interestedUsers.map((user) => ({
      userId: user.id,
      productId: productId,
      notificationTime: new Date(),
    }));

    console.log("yes am in")

    if (notifications.length > 0) {
      await prisma.userNotifications.createMany({ data: notifications });
      console.log(`Notifications created for ${notifications.length} users for product ID: ${productId}`);
    }
  } catch (error) {
    console.error("Error notifying users:", error);
  }
}



cron.schedule('* * * * *', async () => {
  console.log("Running daily notifications task...");
  await sendScheduledNotifications("daily");
});


cron.schedule("0 9 * * 1", async () => {
  console.log("Running weekly notifications task...");
  await sendScheduledNotifications("weekly");
});

cron.schedule("0 9 1 * *", async () => {
  console.log("Running monthly notifications task...");
  await sendScheduledNotifications("monthly");
});


async function sendScheduledNotifications(frequency: string): Promise<void> {
  try {
    const notifications = await prisma.userNotifications.findMany({
      where: {
        sent: false, // Only unsent notifications
        user: {
          frequency: frequency
        }
      },
      include: {
        product: true, // Include related product information
        user: true, // Include related user information
      },
    });
    

    for (const notification of notifications) {
      const user = notification.user;
      const product = notification.product;

      console.log(`Sending ${frequency} notification to ${user.email} for product: ${product.name}`);
      // Here, you would integrate with an email or notification service
      await prisma.userNotifications.update({
        where: { id: notification.id },
        data: { sent: true }, // Mark notification as sent
      });
    }
  } catch (error) {
    console.error(`Error sending ${frequency} notifications:`, error);
  }
}


export const fetchAndSaveAIProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const accessToken = 'xbWxiCV0mYGrPASEFaxQRLhgYeqIK-Sbpf0dqrAwWNw';
    if (!accessToken) {
      throw new Error("Missing Product Hunt Access Token.");
    }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
  const isoString = todayStart.toISOString();

//first: 100, postedAfter: "${startOfDayUTC}"
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


const response = await axios.post<GraphQLResponse>('https://api.producthunt.com/v2/api/graphql', {
  query: query
}, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

  const products = response.data.data.posts.edges;
  console.log(products, "prod")
  const keywords = ["ai", "machine learning", "artificial intelligence"]

  const aiProducts = products.filter((post) => {
    const name = post.node.name.toLowerCase();
    const tagline = post.node.tagline.toLowerCase();

    return keywords.some((keyword) => name.includes(keyword) || tagline.includes(keyword));
  });

  console.log(aiProducts, "ai prod")

 // Save Filtered Products to Database
    const savedProducts = await Promise.all(
      aiProducts.map(async (product) => {
        const existingProduct = await prisma.aiproducts.findUnique({
          where: { id: product.node.id },
        });

        // mark category

        if (!existingProduct) {
          const category = await categorizeProduct(product.node.tagline);
          console.log(category, "cat")

          const newProduct =  await prisma.aiproducts.create({
            data: {
              id: product.node.id,
              name: product.node.name,
              tagline: product.node.tagline,
              createdAt: new Date(product.node.createdAt), // Ensure snake_case for Prisma schema
              url: product.node.url,
              website: product.node.website,
              category
            },
          });

           // Notify users for the new product
           await notifyUsersForNewProduct(newProduct.id, category);

           return newProduct;

        }
        return null;
      })
    );

    // const mockProduct = await prisma.aiproducts.create({
    //   data: {
    //     name: "Test AI Product",
    //     tagline: "This is a test product two",
    //     createdAt: new Date(),
    //     website: "https://test-products.com",
    //     url: "https://test-products.com",
    //     category: "Data Science"
    //   },
    // });
    
   
    // console.log("Mock product created:", mockProduct);

    // Notify users for the mock product
    // await notifyUsersForNewProduct(mockProduct.id, mockProduct.category);

    // Clean up mock product
    // await prisma.aiproducts.delete({ where: { id: mockProduct.id } });
    // console.log("Mock product deleted after testing.");

    res.status(200).json({
      message: "AI products fetched and saved successfully.",
      savedCount: savedProducts.length,
      savedProducts: savedProducts,
    });

  } catch (error) {
    console.error("Error fetching or saving AI products:", error);
    res.status(500).json({ error: "Failed to fetch or save AI products." });
  }

}