import { Document, model, Model, Schema } from "mongoose"
import { isEmail } from 'validator'
import jwt from 'jsonwebtoken'
import keys from '../secret/keys'
import User from '../interfaces/user'
import bcrypt from "bcrypt"
import _ from "lodash"
import createLogger from "../logger/logger"

const logger = createLogger("User Schema")(console.log)

export interface UserDocument extends User, Document {
  generateAuthToken(): Promise<string>
  removeToken(token: string): Promise<void>
}

export interface UserModelInterface extends Model<UserDocument> {
  findByToken(token: string): Promise<UserDocument>
  findByCredentials(email: string, password: string): Promise<UserDocument>
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    required: true,
    minlength: 4,
    unique: true,
    validate: {
      validator: isEmail,
      message: `{VALUE} is not a valid email`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 4
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next()
  }
  const salt = bcrypt.genSaltSync(10)

  //@ts-ignore
  this.password = bcrypt.hashSync(this.password, salt)

  next()
})

UserSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  return _.pick(userObject, ['_id', 'email'])
}

UserSchema.methods.generateAuthToken = function () {
  const user = this
  const access = 'auth'
  const token = jwt.sign({ _id: user._id.toHexString(), access }, keys.jwt_secret)

  user.tokens.push({ access, token })

  return user.save().then(() => {
    return token
  })
}

UserSchema.methods.removeToken = function (token: string): Promise<void> {
  const user = this

  return user.update({
    $pull: {
      tokens: { token }
    }
  })
}

// Functions on user collection
UserSchema.statics.findByToken = async function (token: string): Promise<UserDocument> {
  const User = this
  let decoded: any

  try {
    decoded = jwt.verify(token, keys.jwt_secret)

    const user = await User.findOne({
      '_id': decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    })

    return user
  } catch (error) {
    return Promise.reject()
  }
}

UserSchema.statics.findByCredentials = async function (email: string, password: string): Promise<UserDocument> {
  let User = this
  const user = await User.findOne({ email })

  if (!user) {
    return Promise.reject('Email not found')
  }

  if (!bcrypt.compare(password, user.password)) {
    return Promise.reject('Wrong password')
  }

  return user
}

export const UserModel: UserModelInterface = model<UserDocument, UserModelInterface>('User', UserSchema)
