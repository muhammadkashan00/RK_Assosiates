import app from "./app";
import { logger } from "./lib/logger";
import { connectDB } from "./mongo/config/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

function start() {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

connectDB()
  .then(start)
  .catch((err) => {
    logger.error({ err: err.message }, "Failed to connect to MongoDB; starting server anyway");
    start();
  });
