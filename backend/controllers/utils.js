sendSuccess = (res, data = {}, statusCode = 200) => {
  res.status(statusCode).send(data)
}

sendError = (res, message, error, statusCode = 500) => {
  console.log('Error => ', { message, error })
  res.status(statusCode).send({
    error: error?.message || message || 'something went wrong.'
  })
}

logMessage = (...args) => {
  let log = ''

  for (const arg of args) {
    if ((typeof arg) === 'object') {
      log += JSON.stringify(arg)
    } else {
      log += arg || ''
    }

    log += ' '
  }
  console.log('✏️✏️✏️ logMessage => log :: ', log)
}

logError = (message, exception = null, reqId = null) => {
  const msgObj = {
    reqId,
    message: message || ''
  }

  const obj = {
    msg: `ERROR ${JSON.stringify(msgObj)}`
  }

  if (exception) {
    try {
      // This code is updated to capture google ads error and print it in readable format
      obj.err = exception.errors ? JSON.stringify(exception.errors) : exception
    } catch (e) {
      obj.err = exception
    }
  }

  console.log('⚠️⚠️⚠️ logError =>  :: ', obj)
}

throwError = (code, errorType, errorMessage) => (error) => {
  this.logError(errorMessage, error)
  if (!error) error = new Error(errorMessage || 'Default Error')
  error.code = code
  error.errorType = errorType
  error.message = errorMessage || error.message
  throw error
}

module.exports = {
  sendSuccess,
  sendError,
  throwError,
  logMessage,
  logError
}
