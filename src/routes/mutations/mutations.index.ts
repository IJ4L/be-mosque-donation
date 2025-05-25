import * as Routes from './mutations.routes.ts';
import * as Handlers from './mutations.handler.ts';
import { createRouter } from '../../lib/create-app.ts';

const router = createRouter().
    openapi(Routes.get, Handlers.get).
    openapi(Routes.excel, Handlers.generateExcel).
    openapi(Routes.getSummary, Handlers.getSummary).
    openapi(Routes.payout, Handlers.createPayout).
    openapi(Routes.approvePayout, Handlers.approvePayout);

export default router;