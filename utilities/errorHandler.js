function errorHandler(err, req, res, next) {
  console.error(err.stack);
  const status = err.status || 500;
  const title = status === 404 ? "404 Not Found" : "Server Error";
  const message = status === 404
    ? (err.message || "The page you are looking for does not exist.")
    : (err.message || "Oh no! There was a crash. Maybe try a different route?");
  res.status(status);
  res.render('errors/error', { title, message, error: err });
}

module.exports = errorHandler; 