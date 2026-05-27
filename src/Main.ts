import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/public/AuthRoute";
import reportRoutes from "./routes/private/ReportRoute";
import staffRoutes from "./routes/private/StaffRoute";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

//App routes
//Public routes
app.use("/api/auth", authRoutes);

//Private routes
app.use("/api/reports", reportRoutes);
app.use("/api/staff", staffRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "LaporKampus API is running",
  });
});

export default app;
