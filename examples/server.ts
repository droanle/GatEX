import "reflect-metadata";
import { createApp } from "./app";

const app = createApp();
const PORT = 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.info(`===> Server running on port ${PORT}`);
});
