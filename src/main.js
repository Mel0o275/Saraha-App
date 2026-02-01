import bootstrap from "./app.js";
import { connectDB } from "./db/connection.js";

bootstrap();

await connectDB();

