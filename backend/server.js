import "dotenv/config"
import "dotenv/config"
import app from "./app.js"
import { connectDB } from "./config/db.js"

const port = process.env.PORT || 4000     

// Connect to database
connectDB().catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
})
