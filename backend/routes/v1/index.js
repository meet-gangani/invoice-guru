const v1Routes = require('express').Router()
const companyRoutes = require('./company')
const companyMasterRoutes = require('./companyMaster')
const customerRoutes = require('./customer')
const invoiceRoutes = require('./invoice')
const usersRoutes = require('./users')

v1Routes.use('/users', usersRoutes)
v1Routes.use('/company', companyRoutes)
v1Routes.use('/company-master', companyMasterRoutes)
v1Routes.use('/customer', customerRoutes)
v1Routes.use('/invoice', invoiceRoutes)
v1Routes.get('/', (_req, res) => res.send('Welcome! V1 service.'))

module.exports = v1Routes
