import "./config/zodToOpenapi.config.js"; // Must be first import

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecDoc } from "./config/swagger.js";
import { env } from "./env.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import assetRoutes from "./modules/asset/asset.route.js";
import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/user/user.route.js";
import { NotFoundError } from "./utils/error.utils.js";

const app = express();

const isDevelopment = env.nodeEnv === "development";

// Security Headers (Always first)
app.use(
  helmet({
    // 1. Disable HSTS in development to prevent forced HTTPS redirects on localhost
    strictTransportSecurity: isDevelopment ? false : true,

    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // 2. Disable upgrade-insecure-requests in development
        // to prevent browsers (like Safari) from auto-upgrading HTTP to HTTPS
        "upgrade-insecure-requests": isDevelopment ? null : [],
      },
    },
  })
);

// Configure Morgan middleware to log requests
app.use(morgan(":date[iso] :method :url :status - :response-time ms"));

// Body Parsing (Parses raw data into req.body)
app.use(express.json());

// Other specific middleware (CORS, logging, etc.)
app.use(cookieParser(env.cookieSecret));

app.use(
  cors({
    origin: env.frontendUrl, // frontend server
    credentials: true, // allow cookies
  })
);

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecDoc));

app.get("/test", (req, res) => {
  console.log(`request: ${req.method} ${req.url}`);
  res.send("Digital Assets Manager(DAM) API is running...");
});

app.use("/api/auth", authRoutes());
app.use("/api/users", userRoutes());
app.use("/api/assets", assetRoutes());

// Handle 404 errors
app.all(/.*/, (req, _res, next) => {
  // Pass a custom error to the global handler
  const err = new NotFoundError(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// Global error handler (Always last)
app.use(globalErrorHandler);

export default app;
