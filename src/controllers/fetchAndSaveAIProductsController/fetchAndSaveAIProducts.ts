import { Request, Response } from "express";
import prisma from "../../config/db";
import axios from "axios";


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

export const fetchAndSaveAIProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const accessToken = 'xbWxiCV0mYGrPASEFaxQRLhgYeqIK-Sbpf0dqrAwWNw';
    if (!accessToken) {
      throw new Error("Missing Product Hunt Access Token.");
    }

    const query = `
  {
    posts(first: 100) {
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
  const keywords = ["ai", "machine learning", "artificial intelligence"]

  const aiProducts = products.filter((post) => {
    const name = post.node.name.toLowerCase();
    const tagline = post.node.tagline.toLowerCase();

    return keywords.some((keyword) => name.includes(keyword) || tagline.includes(keyword));
  });

 // Save Filtered Products to Database
    const savedProducts = await Promise.all(
      aiProducts.map(async (product) => {
        const existingProduct = await prisma.aiproducts.findUnique({
          where: { id: product.node.id },
        });

        // mark category

        if (!existingProduct) {
          return await prisma.aiproducts.create({
            data: {
              id: product.node.id,
              name: product.node.name,
              tagline: product.node.tagline,
              createdAt: new Date(product.node.createdAt), // Ensure snake_case for Prisma schema
              url: product.node.url,
              website: product.node.website
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