import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: ["src/entities/**/*.ts"],
    migrations: [],
    subscribers: [],
})
