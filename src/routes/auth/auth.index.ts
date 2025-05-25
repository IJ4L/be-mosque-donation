import * as Routes from './auth.routes.ts';
import * as Handlers from './auth.handlers.ts';
import { createRouter } from '../../lib/create-app.ts';

const router = createRouter()
    .openapi(Routes.login, Handlers.login)
    .openapi(Routes.updateUser, Handlers.updateUser)
    .openapi(Routes.getUser, Handlers.getUser)
    .openapi(Routes.updatePassword, Handlers.updatePassword);

export default router;