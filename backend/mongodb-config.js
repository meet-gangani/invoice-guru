const { connect } = require('mongoose')
const CONSTANTS = require('./global/index')
const { logMessage, logError } = require('./controllers/utils')

let isConnected = false
let database = null
const initializeDb = async (url) => {
  if (isConnected) return database

  try {
    const DB_URL = url || CONSTANTS.MONGODB_URL
    logMessage(`MongoDB URL: ${DB_URL}`)
    console.log('🚀🚀🚀 initializeDb => Connecting to mongoDB')
    database = await connect(DB_URL)
    isConnected = !!(database.connections[0].readyState)
    console.log(`🚀🚀🚀 initializeDb => Database ${database.connections[0].name} Connected`)
    return database
  } catch (error) {
    logError(error.message)
    throw new Error(error)
  }
}

const getOrInitializeDatabase = async (url) => {
  if (!database) {
    return await initializeDb(url)
  }

  return database
}

module.exports = {
  getOrInitializeDatabase
}
