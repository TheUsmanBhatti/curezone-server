const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.options('*', cors())

require('dotenv/config');
const api = process.env.API_URL;


// =======================================  Importing Routers  =====================================

const usersRoutes = require('./routers/users');
const doctorsRoutes = require('./routers/doctors');
const appointmentsRoutes = require('./routers/appointments');
const prescriptionsRoutes = require('./routers/prescriptions');
const categoriesRoutes = require('./routers/categories');
const reviewsRoutes = require('./routers/reviews');


// =======================================  Middleware  ============================================

app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));


// =======================================  Connection with MongoDB  ===============================

mongoose.connect(process.env.CONNECTION_STRING).then(() => {
    console.log("Database Connection");
}).catch((err) => {
    console.log("DB Not Connected");
})


// =======================================  Routers  ===============================================

app.use(`${api}/users`, usersRoutes);
app.use(`${api}/doctors`, doctorsRoutes);
app.use(`${api}/appointments`, appointmentsRoutes);
app.use(`${api}/prescriptions`, prescriptionsRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/reviews`, reviewsRoutes);


// =======================================  Creating Server  =======================================

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
})