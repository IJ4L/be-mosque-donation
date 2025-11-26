import { createRouter } from "../../lib/create-app.js";
import * as routes from "./image.routes.js";
import * as handlers from "./image.handlers.js";
const router = createRouter().openapi(routes.get, handlers.getImage);
export default router;
