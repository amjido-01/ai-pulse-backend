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
const nodemailer_1 = __importDefault(require("nodemailer"));
// Nodemailer transporter configuration
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password or app password
    },
});
function sendEmail(to, subject, body) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield transporter.sendMail({
                from: process.env.EMAIL,
                to,
                subject,
                text: body,
            });
            console.log(`Email sent to ${to}`);
        }
        catch (error) {
            console.error(`Failed to send email to ${to}:`, error);
        }
    });
}
function notifyUsersForNewProduct(productId, name, category, website) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const interestedUsers = yield db_1.default.user.findMany({
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
                yield db_1.default.userNotifications.createMany({ data: notifications });
                console.log(`Notifications created for ${notifications.length} users for product "${name}"`);
            }
        }
        catch (error) {
            console.error("Error notifying users:", error);
        }
    });
}
function sendNotificationsToUsers(users) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (const user of users) {
                const emailContent = yield Promise.all(user.notifications.map((notification) => __awaiter(this, void 0, void 0, function* () {
                    const product = yield db_1.default.aiproducts.findUnique({
                        where: { id: notification.productId },
                    });
                    if (product) {
                        yield db_1.default.userNotifications.update({
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
                })));
                const emailBody = `
        Hello ${user.name},

        Here are the latest AI products that match your interests:

        ${emailContent.filter(Boolean).join("\n\n")}

        Best regards,
        Your AI Notification App Team
      `;
                yield sendEmail(user.email, "Your Latest AI Product Updates", emailBody);
                console.log(`Email sent to ${user.email}:\n${emailBody}`);
                // Add email sending logic here (e.g., using Nodemailer or a third-party service).
            }
        }
        catch (error) {
            console.error("Error sending notifications:", error);
        }
    });
}
function findUsersBasedOnFrequency(frequency) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield db_1.default.user.findMany({
                where: {
                    frequency,
                    notifications: {
                        some: { sent: false },
                    },
                },
                include: {
                    notifications: {
                        where: { sent: false },
                    },
                },
            });
            yield sendNotificationsToUsers(users);
        }
        catch (error) {
            console.error(`Error finding users for frequency "${frequency}":`, error);
        }
    });
}
const fetchAndSaveAIProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = process.env.PRODUCT_HUNT_ACCESS_TOKEN;
        // const todayStart = new Date();
        // todayStart.setHours(0, 0, 0, 0);
        // const isoString = todayStart.toISOString();
        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1); // Subtract one day
        yesterdayStart.setHours(0, 0, 0, 0); // Set to the start of the day
        const isoStringYesterday = yesterdayStart.toISOString();
        console.log(isoStringYesterday);
        const query = `
      {
        posts(postedAfter: "${isoStringYesterday}") {
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
        const response = yield axios_1.default.post("https://api.producthunt.com/v2/api/graphql", {
            query,
        }, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const products = response.data.data.posts.edges;
        console.log(products);
        const keywords = ["ai", "machine learning", "artificial intelligence"];
        const aiProducts = products.filter((post) => {
            const name = post.node.name.toLowerCase();
            const tagline = post.node.tagline.toLowerCase();
            return keywords.some((keyword) => name.includes(keyword) || tagline.includes(keyword));
        });
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
                yield notifyUsersForNewProduct(newProduct.id, newProduct.name, newProduct.website, category);
                return newProduct;
            }
            return null;
        })));
        res.status(200).json({
            message: "AI products fetched and saved successfully.",
            savedCount: savedProducts.filter(Boolean).length,
            savedProducts,
        });
    }
    catch (error) {
        console.error("Error fetching or saving AI products:", error);
        res.status(500).json({ error: "Failed to fetch or save AI products." });
    }
});
exports.fetchAndSaveAIProducts = fetchAndSaveAIProducts;
node_cron_1.default.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Running daily notifications task...");
    yield findUsersBasedOnFrequency("daily");
}));
node_cron_1.default.schedule("0 9 * * 1", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Running weekly notifications task...");
    yield findUsersBasedOnFrequency("weekly");
}));
node_cron_1.default.schedule("0 9 1 * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Running monthly notifications task...");
    yield findUsersBasedOnFrequency("monthly");
}));
//# sourceMappingURL=fetchAndSaveAIProducts.js.map