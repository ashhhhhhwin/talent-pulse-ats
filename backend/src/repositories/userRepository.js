const { query, sql } = require('../config/database')

async function findByEmail(email) {
  const result = await query(
    `SELECT u.UserId, u.Name, u.Email, u.PasswordHash, u.RoleId, r.RoleName
     FROM Users u INNER JOIN Roles r ON u.RoleId = r.RoleId
     WHERE u.Email = @email`,
    { email },
  )
  return result.recordset[0] || null
}

async function findById(userId) {
  const result = await query(
    `SELECT u.UserId, u.Name, u.Email, u.RoleId, r.RoleName, u.CreatedAt
     FROM Users u INNER JOIN Roles r ON u.RoleId = r.RoleId
     WHERE u.UserId = @userId`,
    { userId },
  )
  return result.recordset[0] || null
}

async function create({ name, email, passwordHash, roleId }) {
  const result = await query(
    `INSERT INTO Users (Name, Email, PasswordHash, RoleId)
     OUTPUT INSERTED.UserId, INSERTED.Name, INSERTED.Email, INSERTED.RoleId, INSERTED.CreatedAt
     VALUES (@name, @email, @passwordHash, @roleId)`,
    { name, email, passwordHash, roleId },
  )
  return result.recordset[0]
}

async function getRoleByName(roleName) {
  const result = await query(`SELECT RoleId, RoleName FROM Roles WHERE RoleName = @roleName`, { roleName })
  return result.recordset[0] || null
}

module.exports = { findByEmail, findById, create, getRoleByName }
