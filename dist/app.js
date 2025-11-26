import createApp from "./lib/create-app.js";
import news from "./routes/news/news.index.js";
import image from "./routes/image/image.index.js";
import donation from "./routes/donations/donations.index.js";
import mutation from "./routes/mutations/mutations.index.js";
import auth from "./routes/auth/auth.index.js";
const app = createApp();
const routes = [image, news, donation, mutation, auth];
routes.forEach((route) => {
    app.route("/", route);
});
export default app;
