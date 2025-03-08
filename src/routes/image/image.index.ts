import { createRouter } from "../../lib/create-app.ts";

import * as routes from "./image.routes.ts";
import * as handlers from "./image.handlers.ts";

const router = createRouter().openapi(routes.get, handlers.getImage);

export default router;