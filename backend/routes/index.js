const privateRoutes = require('express').Router()
const publicRoutes = require('express').Router()
const v1PublicRoutes = require('./v1/public')
const v1Routes = require('./v1')
const invoiceApiRoutes = require('./api/invoices')

// TODO : v1 recommended for long-term
privateRoutes.use('/v1', v1Routes)
privateRoutes.use('/api/invoices', invoiceApiRoutes)
publicRoutes.use('/v1', v1PublicRoutes)
publicRoutes.get('/', (_req, res) => res.send('Welcome! service is in tip-top condition.'))

module.exports = {
  privateRoutes,
  publicRoutes
}
