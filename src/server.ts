import dotenv from "dotenv/config"

import app from "./app.js"
import config from "./config/config.js"

app.listen(process.env.PORT || 3000, (err) => {
    if(err){
        console.error({
            message: err.message,
            cause: err.cause,
            trace: err.stack
        })
    }
    console.log(`app is listening on port ${config.port}`)
})