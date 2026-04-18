require('dotenv').config();
const cors = require('cors');
const path = require('path')
const AuthenticateUser = require("./App/Middleware/user-authenticate")
const AuthorizeUser = require("./App/Middleware/user-authorize")
const Usercltr = require("./App/Controller/user-controller")
const configureDB = require("./config/db")
const inventoryRoutes = require("./App/Routes/InventoryRoutes")
const stockRoutes = require("./App/Routes/StockRoutes")
const dashboardRoutes=require("./App/Routes/DashboardRoutes")
const productRoutes=require("./App/Routes/productRoutes")
const locationRoutes=require("./App/Routes/locationRoutes")
const orderRoutes=require("./App/Routes/orderRoutes")
const activityRoutes=require("./App/Routes/ActivityRoutes")
const notificationRoutes=require("./App/Routes/notificationRoutes")
const express = require('express');
const port = 4444;


const app = express();

app.use(cors())
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

configureDB();


app.post("/api/users", Usercltr.Register)
app.post("/api/login", Usercltr.Login)
app.get("/api/account", AuthenticateUser, Usercltr.Account)
app.put("/api/account", AuthenticateUser, Usercltr.updateAccount)
app.get("/api/users", AuthenticateUser, AuthorizeUser(["admin"]), Usercltr.listUsers)
app.put("/api/users/:id/role", AuthenticateUser, AuthorizeUser(["admin"]), Usercltr.updateRole)

app.use("/api", inventoryRoutes)
app.use("/api", stockRoutes)
app.use("/api",dashboardRoutes)
app.use("/api",productRoutes)
app.use("/api",locationRoutes)
app.use("/api",orderRoutes)
app.use("/api",activityRoutes)
app.use("/api",notificationRoutes)

app.listen(port, () => {

    console.log(`warehouse server is running on port number ${port}`)
})


