const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const env = require('../config/env')
const userRepo = require('../repositories/userRepository')
const { AppError } = require('../middleware/errorMiddleware')

async function register({ name, email, password, roleId }) {
  const existing = await userRepo.findByEmail(email)
  if (existing) throw new AppError('Email already registered', 409)

  let resolvedRoleId = roleId
  if (!resolvedRoleId) {
    const recruiter = await userRepo.getRoleByName('RECRUITER')
    resolvedRoleId = recruiter?.RoleId || 2
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await userRepo.create({ name, email, passwordHash, roleId: resolvedRoleId })
  const full = await userRepo.findById(user.UserId)
  return { user: sanitizeUser(full), token: signToken(full) }
}

async function login({ email, password }) {
  const user = await userRepo.findByEmail(email)
  if (!user) throw new AppError('Invalid email or password', 401)

  const ok = await bcrypt.compare(password, user.PasswordHash)
  if (!ok) throw new AppError('Invalid email or password', 401)

  return { user: sanitizeUser(user), token: signToken(user) }
}

async function getProfile(userId) {
  const user = await userRepo.findById(userId)
  if (!user) throw new AppError('User not found', 404)
  return sanitizeUser(user)
}

function signToken(user) {
  return jwt.sign(
    { userId: user.UserId, email: user.Email, roleName: user.RoleName },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn },
  )
}

function sanitizeUser(user) {
  return {
    userId: user.UserId,
    name: user.Name,
    email: user.Email,
    roleId: user.RoleId,
    roleName: user.RoleName,
    createdAt: user.CreatedAt,
  }
}

module.exports = { register, login, getProfile }
