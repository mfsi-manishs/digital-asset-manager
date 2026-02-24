export const getEnv = () => {
  return {
    nodeEnv: process.env.NODE_ENV || "development",
    host: required("HOST"),
    port: Number(required("PORT")),
    services: {
      imageServiceApiKey: required("IMAGE_SERVICE_API_KEY"),
      videoServiceApiKey: required("VIDEO_SERVICE_API_KEY"),
    },
    db: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      username: required("DB_USER"),
      password: required("DB_PASS"),
      database: required("DB_NAME"),
      dialect: "postgres" as const, // or "mysql" | "mariadb" | "sqlite" | "mssql"
      logging: process.env.DB_LOGGING === "true",
    },
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
    minio: {
      host: process.env.MINIO_HOST || "localhost",
      port: Number(process.env.MINIO_PORT) || 9000,
      username: required("MINIO_ROOT_USER"),
      password: required("MINIO_ROOT_PASSWORD"),
    },
  };

  function required(key: string): string {
    const value = process.env[key];
    if (!value) {
      const msg = `Missing environment variable: ${key}`;
      console.error(msg);
      throw new Error(msg);
    }
    return value;
  }
};
