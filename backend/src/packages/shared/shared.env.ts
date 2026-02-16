export const getEnv = () => {
  return {
    nodeEnv: process.env.NODE_ENV || "development",
    db: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      username: required("DB_USER"),
      password: required("DB_PASS"),
      database: required("DB_NAME"),
      dialect: "postgres" as const, // or "mysql" | "mariadb" | "sqlite" | "mssql"
      logging: process.env.DB_LOGGING === "true",
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
