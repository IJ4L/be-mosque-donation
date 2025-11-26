import * as Routes from "./auth.routes.js";
import * as Handlers from "./auth.handlers.js";
import { createRouter } from "../../lib/create-app.js";

const router = createRouter()
  .openapi(Routes.login, Handlers.login)
  .openapi(Routes.updateUser, Handlers.updateUser)
  .openapi(Routes.getUser, Handlers.getUser)
  .openapi(Routes.updatePassword, Handlers.updatePassword);

export default router;
