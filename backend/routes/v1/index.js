const v1Routes = require('express').Router()
const companyRoutes = require('./company')
const invoiceRoutes = require('./invoice')

v1Routes.use('/company', companyRoutes)
v1Routes.use('/invoice', invoiceRoutes)
v1Routes.get('/', (_req, res) => res.send('Welcome! V1 service.'))

module.exports = v1Routes
