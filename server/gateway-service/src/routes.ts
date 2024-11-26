import { Application } from 'express'
import { healthRoutes } from '@gateway/routes/healthy'
import { authRoutes } from '@gateway/routes/auth'
import { currentUserRoutes } from '@gateway/routes/current-user'
import { authMiddleware } from '@gateway/services/auth-middleware'
import { searchRoutes } from '@gateway/routes/search'

const BASE_PATH = '/api/gateway/v1'

export const appRoutes = (app: Application) => {
    app.use('', healthRoutes.routes())
    app.use(BASE_PATH, searchRoutes.routes());
    app.use(BASE_PATH, authRoutes.routes())
    
    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes())
}