
function handleError(res, err, message = 'Server error', status = 500) {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    console.error(err);
  } else {
    console.error(`${message}:`, err.message);
  }

  return res.status(status).json({ error: message });
}

module.exports = handleError;
