require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const customerRoutes = require('./src/routes/customerRoutes');
const vendorRoutes = require('./src/routes/vendorRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// connect DB
connectDB(process.env.MONGO_URI);

// routes
app.use('/api/customers', customerRoutes);
app.use('/api/vendors', vendorRoutes);
app.use("/api/audit", require("./src/routes/auditRoutes"));
app.use("/api/meta", require("./src/routes/metaRoutes"));
app.use("/api/projects", require("./src/routes/projectRoutes"));
app.use("/api/uploads", require("./src/routes/uploads"));






app.get('/', (req, res) => res.send('ERP Internship Server is up-to-date'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
