"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndSaveAIProducts = void 0;
const db_1 = __importDefault(require("../../config/db"));
const axios_1 = __importDefault(require("axios"));
const categorizeProduct_1 = require("../../api/categorizeProduct");
const node_cron_1 = __importDefault(require("node-cron"));
// import nodemailer from "nodemailer";
const sendEmail_1 = require("../../utils/sendEmail");
// Notify users based on interest
function notifyUsersForNewProduct(productId, name, category, website) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const interestedUsers = yield db_1.default.user.findMany({
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
                yield db_1.default.userNotifications.createMany({ data: notifications });
                console.log(`Notifications created for ${notifications.length} users for product "${name}"`);
            }
        }
        catch (error) {
            console.error("Error notifying users:", error);
        }
    });
}
// Fetch and save AI products
const fetchAndSaveAIProducts = (res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield axios_1.default.post("https://api.producthunt.com/v2/api/graphql", { query }, { headers: { Authorization: `Bearer ${accessToken}` } });
        const products = response.data.data.posts.edges;
        const keywords = ["ai", "machine learning", "artificial intelligence"];
        const aiProducts = products.filter((post) => {
            const name = post.node.name.toLowerCase();
            const tagline = post.node.tagline.toLowerCase();
            return keywords.some((keyword) => name.includes(keyword) || tagline.includes(keyword));
        });
        console.log(aiProducts, "prod");
        const savedProducts = yield Promise.all(aiProducts.map((product) => __awaiter(void 0, void 0, void 0, function* () {
            const existingProduct = yield db_1.default.aiproducts.findUnique({
                where: { id: product.node.id },
            });
            if (!existingProduct) {
                const category = yield (0, categorizeProduct_1.categorizeProduct)(product.node.tagline);
                const newProduct = yield db_1.default.aiproducts.create({
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
                yield notifyUsersForNewProduct(newProduct.id, newProduct.name, category, newProduct.website);
                return newProduct;
            }
            return null;
        })));
        res === null || res === void 0 ? void 0 : res.status(200).json({
            message: "AI products fetched and saved successfully.",
            savedCount: savedProducts.filter(Boolean).length,
            savedProducts,
        });
    }
    catch (error) {
        console.error("Error fetching or saving AI products:", error);
        res === null || res === void 0 ? void 0 : res.status(500).json({ error: "Failed to fetch or save AI products." });
    }
});
exports.fetchAndSaveAIProducts = fetchAndSaveAIProducts;
// Send notifications
function sendNotificationsBasedOnFrequency(frequency) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const now = new Date();
            const today = now.getDate();
            const dayOfWeek = now.getDay();
            const users = yield db_1.default.user.findMany({
                where: Object.assign(Object.assign({ frequency }, (frequency === "weekly" && {
                    registeredAt: {
                        gte: new Date(now.setDate(now.getDate() - dayOfWeek)), // Start of the week
                        lte: new Date(now.setDate(now.getDate() - dayOfWeek + 6)), // End of the week
                    },
                })), (frequency === "monthly" && {
                    registeredAt: {
                        gte: new Date(now.getFullYear(), now.getMonth(), 1), // Start of the month
                        lte: new Date(now.getFullYear(), now.getMonth() + 1, 0), // End of the month
                    },
                })),
                include: {
                    notifications: { where: { sent: false },
                        include: {
                            product: true
                        }
                    },
                },
            });
            for (const user of users) {
                console.log(user.notifications);
                const emailBody = `
Hello ${user.name},

Here are the latest AI products that match your interests:

${user.notifications
                    .map((notification) => `
Product Name: ${notification.productName}
Website: ${notification.website}
Description: ${notification.product.tagline || "No description available."}
Learn more: ${notification.product.url || "No link available."}
`)
                    .join("\n")}

Best regards,  
Your AI Notification App Team
`;
                // Function to send the email
                yield (0, sendEmail_1.sendEmail)(user.email, "Your Latest AI Product Updates", emailBody);
                yield db_1.default.userNotifications.updateMany({
                    where: { userId: user.id, sent: false },
                    data: { sent: true },
                });
                console.log(`Notifications sent to ${user.email}, ${emailBody}`);
            }
        }
        catch (error) {
            console.error(`Error sending notifications for ${frequency}:`, error);
        }
    });
}
// CRON Jobs
node_cron_1.default.schedule("0 11 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.fetchAndSaveAIProducts)();
    (0, sendEmail_1.sendEmail)("youndsadeeq10@gmail.com", "Your Latest AI Product Updates 9:00", "ye its time");
}));
node_cron_1.default.schedule("0 19 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.fetchAndSaveAIProducts)();
    (0, sendEmail_1.sendEmail)("youndsadeeq10@gmail.com", "Your Latest AI Product Updates 9:00", "ye its time");
}));
node_cron_1.default.schedule("0 20 * * *", () => sendNotificationsBasedOnFrequency("daily")); // Daily notifications
node_cron_1.default.schedule("0 20 * * 0", () => sendNotificationsBasedOnFrequency("weekly")); // Weekly notifications (Sunday)
node_cron_1.default.schedule("0 20 1 * *", () => sendNotificationsBasedOnFrequency("monthly")); // Monthly notifications (1st day)
//# sourceMappingURL=fetchAndSaveAIProducts.js.map