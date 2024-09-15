import mongoose from "mongoose"
import { config } from "./config/config.js"

export const connDB = async () => {
    try {
        await mongoose.connect(
            config.MONGO_URL,
            {dbName:config.DB_NAME}
        )
        console.log(`DB Conectada.`)
    } catch (error) {
        console.log(`Error al conectar a DB: ${error.message}`)
    }
}
