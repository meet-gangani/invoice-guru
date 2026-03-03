const v1Routes = require('express').Router()
const companyRoutes = require('./company')
const categoryRoutes = require('./category')

v1Routes.use('/company', companyRoutes)
v1Routes.use('/categories', categoryRoutes)
v1Routes.get('/', (_req, res) => res.send('Welcome! V1 service.'))

module.exports = v1Routes
