import app from './app.js';
import config from './config/config.js';

app.listen(process.env.PORT || 3000, err => {
  if (err) {
    console.error({
      message: err.message,
      cause: err.cause,
      trace: err.stack,
    });
  }
  console.log(`[App] App is listening on port http://localhost:${config.port}`);
});
