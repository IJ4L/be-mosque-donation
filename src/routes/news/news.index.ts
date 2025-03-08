import { createRouter } from "../../lib/create-app.ts";

import * as routes from "./news.routes.ts";
import * as handlers from "./news.handlers.ts";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);

export default router;