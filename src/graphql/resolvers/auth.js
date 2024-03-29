const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/user')

module.exports = {
  // singup
  singup: async args => {
    const { username, email, password } = args.userInput

    const existingUser = await User.findOne({ email: email })
    if (existingUser) {
      throw new Error('User exists already.')
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({
      username,
      email,
      password: hashedPassword
    })

    const result = await user.save()
    return { ...result._doc, password: null, _id: result.id }
  },
  // login
  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email })
    if (!user) {
      throw new Error('User does not exist!')
    }
    const isEqual = await bcrypt.compare(password, user.password)
    if (!isEqual) {
      throw new Error('Password is incorrect!')
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.TOKEN_KEY,
      { expiresIn: '1h' }
    )
    return { userId: user.id, token: token, tokenExpiration: 1 }
  }
}
