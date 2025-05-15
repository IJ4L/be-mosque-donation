import * as Routes from './mutations.routes.ts';
import * as Handlers from './mutations.handler.ts';
import { createRouter } from '../../lib/create-app.ts';

const router = createRouter().
    openapi(Routes.get, Handlers.get).
    openapi(Routes.excel, Handlers.generateExcel).
    openapi(Routes.getSummary, Handlers.getSummary);

export default router;