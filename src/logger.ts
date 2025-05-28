import pino from "pino";
import fs from "fs";
import path from "path";

// Ensure the logs directory exists
const logDir = path.dirname("logs/email.log");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
      {
        target: "pino/file",
        options: { destination: "logs/email.log" },
      },
    ],
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
