import { Request, Response } from "express";
import prisma from "../../config/db";
import axios from "axios";
import Groq from "groq-sdk";


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


interface ProductNode {
  id: string;
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


// Function to determine the category using Llama 3
async function categorizeProduct(tagline: string): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI assistant acting as a professional text analyzer and you will be giving a tagline of an ai software. Your job is to analyze the following tagline: "${tagline}" and determine the most appropriate category the software belongs to based on the key word from the tagline. Respond with a single word that represents the category. Avoid generic responses like 'others'.`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    return response.choices[0]?.message?.content?.trim() || "uncategorized";
  } catch (error) {
    console.error("Error categorizing product tagline:", error);
    return "uncategorized"; // Default category if the API fails
  }
}



const test = async () => {
  console.log(await categorizeProduct("The only blockchain calculator you'll ever need"), "hello")
}

test()




export const fetchAndSaveAIProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const accessToken = 'xbWxiCV0mYGrPASEFaxQRLhgYeqIK-Sbpf0dqrAwWNw';
    if (!accessToken) {
      throw new Error("Missing Product Hunt Access Token.");
    }

  const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
const isoString = todayStart.toISOString();
console.log(isoString, "kkkkkk");

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

          return await prisma.aiproducts.create({
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
        }
        return null;
      })
    );

    // Filter out null results (already existing products)
    const newProducts = savedProducts.filter((product) => product !== null);

    // Respond with Saved Products
    res.status(200).json({
      message: "AI products fetched and saved successfully.",
      savedCount: newProducts.length,
      savedProducts: newProducts,
    });

  } catch (error) {
    console.error("Error fetching or saving AI products:", error);
    res.status(500).json({ error: "Failed to fetch or save AI products." });
  }

}