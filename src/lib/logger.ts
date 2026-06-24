type LogLevel = "debug" | "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

function emit(level: LogLevel, message: string, fields?: LogFields) {
  const entry = {
    level,
    msg: message,
    ts: new Date().toISOString(),
    ...(fields ?? {}),
  };

  const line = JSON.stringify(entry);
  const out =
    level === "error" || level === "warn"
      ? console.error
      : level === "info"
        ? console.info
        : console.log;
  out(line);
}

export const logger = {
  debug(message: string, fields?: LogFields) {
    emit("debug", message, fields);
  },
  info(message: string, fields?: LogFields) {
    emit("info", message, fields);
  },
  warn(message: string, fields?: LogFields) {
    emit("warn", message, fields);
  },
  error(message: string, fields?: LogFields) {
    emit("error", message, fields);
  },
};
