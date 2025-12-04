import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // REMOVED: The 'transport' configuration block.
  // This removes the worker thread dependency that was causing the crash.
  base: {
    env: process.env.NODE_ENV,
  },
});

export default logger;
