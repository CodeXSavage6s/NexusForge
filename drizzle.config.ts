import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",                
  //driver: "neon",                       
  schema: "./database/schema/*", 
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!, 
  },
});
