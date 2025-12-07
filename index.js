const express = require('express');
const cors = require('cors');
const port = 3000;

const app = express()


app.listen(port , () => {
    console.log(`Study-mate Server is Running on Port :: ${port}` )
})