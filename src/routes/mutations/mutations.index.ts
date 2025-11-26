import * as Routes from "./mutations.routes.js";
import * as Handlers from "./mutations.handler.js";
import { createRouter } from "../../lib/create-app.js";

const router = createRouter()
  .openapi(Routes.get, Handlers.get)
  .openapi(Routes.excel, Handlers.generateExcel)
  .openapi(Routes.getSummary, Handlers.getSummary)
  .openapi(Routes.payout, Handlers.createPayout)
  .openapi(Routes.approvePayout, Handlers.approvePayout);

export default router;
