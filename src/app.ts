import express from "express"

const app = express()

app.get("/", (req, res) => {
    res.json({
        message: "Hello world!",
        data: null,
    }).status(200)
})


export default app