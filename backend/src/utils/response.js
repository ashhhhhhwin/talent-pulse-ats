function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data })
}

function created(res, data) {
  return success(res, data, 201)
}

function paginated(res, data, meta) {
  return res.status(200).json({ success: true, data, meta })
}

function error(res, message, status = 500, errors = null) {
  const body = { success: false, message }
  if (errors) body.errors = errors
  return res.status(status).json(body)
}

module.exports = { success, created, paginated, error }
