const logger = {
  info: (obj: object, msg?: string) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify({ level: "info", msg, ...obj }));
    }
  },
  warn: (obj: object, msg?: string) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn(JSON.stringify({ level: "warn", msg, ...obj }));
    }
  },
  error: (obj: object, msg?: string) => {
    if (process.env.NODE_ENV !== "test") {
      console.error(JSON.stringify({ level: "error", msg, ...obj }));
    }
  },
};

export default logger;
