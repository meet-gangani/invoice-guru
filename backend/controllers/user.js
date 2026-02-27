const { UserStore } = require('../models')
const { sendSuccess, sendError } = require('./utils')
const constants = require('../global')
const bcrypt = require('bcrypt')
const _ = require('lodash')
const crypto = require('crypto')
const speakeasy = require('speakeasy')
const nodeMailer = require('nodemailer')
const transporter = nodeMailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'darrel16@ethereal.email',
    pass: 'Mc9Ntt8EQYp1kmFnjr'
  }
})

const codelabCareTransporter = nodeMailer.createTransport({
  host: 'sh104.webhostingservices.com',
  port: 465,
  auth: {
    user: 'care@codelabacademy.com',
    pass: 'BgODLIvKSFoM'
  }
})
const getUsers = async (req, res) => {
  try {
    const users = await UserStore.find()

    sendSuccess(res, { data: users })
  } catch (error) {
    sendError(res, 'Error while fetching users.', error)
  }
}

const addUser = async (req, res) => {
  try {
    const userInfo = req.body

    if (!userInfo) {
      return sendError(res, 'User not available.', null, 404)
    }

    const user = await new UserStore(userInfo).save()

    sendSuccess(res, { data: user })
  } catch (error) {
    sendError(res, 'Error while adding user.', error)
  }
}

const register = async (req, res) => {
  try {
    const info = req.body
    if (!info) {
      return sendError(res, 'User not found', null, 404)
    }

    let user = await UserStore.findOne({ email: req.body.email })
    if (user) {
      return sendError(res, 'User already registered', null, 404)
    }

    user = new UserStore(_.pick(req.body, [ '_id', 'email', 'password' ]))

    user.password = await bcrypt.hash(user.password, constants.security.SALT)

    user = await user.save()

    const token = user.generateAuthToken()

    res.header('authentication', token)

    sendSuccess(res, { data: user })
  } catch (error) {
    return sendError(res, 'user not add', error, 500)
  }
}

const verifyUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await UserStore.findOne({ email })

    if (!user) {
      return sendError(res, 'Invalid Email', null, 404)
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return sendError(res, 'Invalid Password', null, 404)
    }

    sendSuccess(res, { data: user })
  } catch (error) {
    sendError(res, 'Invalid email or password', error, 500)
  }
}

const login = async (req, res) => {
  try {
    const { email } = req.body

    const user = await UserStore.findOne({ email })
    if (!user) {
      return sendError(res, 'User not found', null, 400)
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) {
      return sendError(res, 'Invalid Password.', null, 400)
    }

    const token = user.generateAuthToken()
    sendSuccess(res, { token })
  } catch (error) {
    return sendError(res, 'Something went wrong in log-in', error, 500)
  }
}

const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body

    const user = await UserStore.findOne({ email })
    if (!user) {
      return sendError(res, 'user not found', null, 400)
    }

    const resetToken = crypto.randomBytes(20).toString('hex')
    const resetTokenExpiry = Date.now() + 600000

    await UserStore.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpiry
    })

    await transporter.sendMail({
      from: 'darrel16@ethereal.email',
      to: `${user}`,
      subject: 'Reset your account password',
      text: `Hi, ${user.userName}`,
      html: `<div style="display: flex; align-items: center; justify-content: center">
                <div style="display: flex; flex-direction: column; align-items: center; padding: 50px 20px;">
                   <img src= 'https://picsum.photos/200/300' width="200" height="200" style="border-radius: 100px" />
                   <div style="display: flex; flex-direction: column; align-items: center;">
                      <p style="font-size: larger; font-weight: bold; color: #333239; word-break: keep-all; font-size: larger; margin-top: 20px">We are sending this email because you</p>
                      <p style="font-size: larger; font-weight: bold; color: #333239; word-break: keep-all; font-size: larger; margin-top: 4px; text-align: center">requested for password reset.Click on this link to create a new password:<p>
                   </div>
                   <button style="border: 1px solid black; font-size: larger; padding: 10px 20px; background-color: #0C056A; color: #D9F1F3; border-radius: 10px">Set a new password</button> 
                   <p style="font-size: larger; font-weight: bold; color: #333239; margin-top: 26px; text-align: center">So, Let\'s reset your Account password.</p>
                </div>
             </div>`
    })

    res.send('Email sended successfully')

  } catch (error) {
    return sendError(res, 'User not exist in database', error, 500)
  }
}

const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params

    const user = await UserStore.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
      return sendError(res, 'Invalid or expired token', null, 400)
    } else {
      return sendSuccess(res, { data: 'Valid token' }, 200)
    }

  } catch (error) {
    return sendError(res, 'Internal server error', error, 500)
  }
}

const resetPassword = async (req, res) => {
  try {

    const { token } = req.params
    const { password } = req.body

    const user = await UserStore.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
      return sendError(res, 'Invalid or expired token', null, 400)
    }

    user.password = await bcrypt.hash(password, 10)
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    sendSuccess(res, { data: user })

  } catch (error) {
    return sendError(res, 'Internal server error', error, 500)
  }
}

const register2FA = async (req, res) => {
  try {
    const { userId } = req.body

    const user = await UserStore.findOne({ _id: userId })

    if (!user) {
      return sendError(res, 'User not found', null, 400)
    }

    const secret = speakeasy.generateSecret({ length: 20 })
    user[userId] = { secret: secret.base32, enable: false }
    const secretKey = { secret: secret.base32, uri: secret.otpauth_url }
    sendSuccess(res, { data: secretKey })
  } catch (error) {
    return sendError(res, 'secretKey is not add in user data', error, 500)
  }
}

const verify2FAToken = async (req, res) => {
  try {
    const { userId, token } = req.body

    let user = await UserStore.findOne({ _id: userId })

    if (!user) {
      return sendError(res, 'User not found', null, 400)
    }
    // if (!user.enable) {
    //   return sendSuccess(res, 'Login successful')
    // }

    const verifyToken = speakeasy.totp.verify({
      secret: user[userId].secret,
      encoding: 'base32',
      token,
      window: 1
    })

    if (verifyToken) {
      return sendSuccess(res, 'valid 2FA token')
    }

  } catch (error) {
    return sendError(res, 'Invalid 2FA token', error, 500)
  }
}

const logIn2FA = async (req, res) => {
  try {
    const { userId, password } = req.body

    let user = await UserStore.findOne({ _id: userId })

    if (!user) {
      return sendError(res, 'User not found', null, 400)
    }

    const verifyPassword = await bcrypt.compare(password, user.password)

    if (!verifyPassword) {
      return sendError(res, 'Invalid password', null, 400)
    }

    // const secret = speakeasy.generateSecret({length: 20})
    // user = { secret: secret.base32, enable: false }

    if (!user.enable) {
      return sendSuccess(res, 'Login successful')
    }

    // const verifyToken = speakeasy.totp.verify({
    //   secret: user.secret,
    //   encoding: 'base32',
    //   token,
    //   window: 1
    // })
    //
    // if (verifyToken) {
    //   return sendSuccess(res, 'Login successful')
    // } else {
    //   return sendError(res, 'Invalid 2FA token', null, 401)
    // }

  } catch (error) {
    return sendError(res, 'User 2FA token is not valid for login', error, 500)
  }
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await UserStore.findById({ _id: '3f10932a-0851-4c08-b7df-247f8664c246' })

    const compareCurrentPassword = await bcrypt.compare(currentPassword, user.password)

    if (!compareCurrentPassword) return sendError(res, 'Invalid password', null, 400)

    user.password = await bcrypt.hash(newPassword, constants.security.SALT)

    await UserStore.findByIdAndUpdate('3f10932a-0851-4c08-b7df-247f8664c246', { password: user.password })
    sendSuccess(res, {
      message: 'Password has been updated'
    })
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = {
  getUsers,
  addUser,
  register,
  login,
  verifyUser,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  register2FA,
  verify2FAToken,
  logIn2FA,
  changePassword
}
