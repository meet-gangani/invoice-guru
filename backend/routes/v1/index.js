const v1Routes = require('express').Router()
const gameRoutes = require('./game')
const categoryRoutes = require('./category')
const userRoutes = require('./user')
const pagesRoutes = require('./page')
const trendingRoutes = require('./trending')
const featuresRoutes = require('./feature')
const blogRoutes = require('./blog')

v1Routes.use('/games', gameRoutes)
v1Routes.use('/categories', categoryRoutes)
v1Routes.use('/users', userRoutes)
v1Routes.use('/pages', pagesRoutes)
v1Routes.use('/trending', trendingRoutes)
v1Routes.use('/feature', featuresRoutes)
v1Routes.use('/blogs', blogRoutes)
v1Routes.get('/', (_req, res) => res.send('Welcome! V1 service.'))

module.exports = v1Routes
