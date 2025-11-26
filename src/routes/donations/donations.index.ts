import * as Routes from "./donations.routes.js";
import * as Handlers from "./donations.handlers.js";
import { createRouter } from "../../lib/create-app.js";

const router = createRouter()
  .openapi(Routes.create, Handlers.create)
  .openapi(Routes.get, Handlers.get)
  .openapi(Routes.callback, Handlers.midtransCallback)
  .openapi(Routes.excel, Handlers.generateExcel)
  .openapi(Routes.getTopDonations, Handlers.getTopDonations);

export default router;
