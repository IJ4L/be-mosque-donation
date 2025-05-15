import createApp from "./lib/create-app.ts";
import news from "./routes/news/news.index.ts";
import image from "./routes/image/image.index.ts";             
import donation from "./routes/donations/donations.index.ts";
import mutation from "./routes/mutations/mutations.index.ts";

const app = createApp();
const routes = [image, news, donation, mutation] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export default app;