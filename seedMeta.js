// seedMeta.js
require("dotenv").config();
const mongoose = require("mongoose");
const MetaData = require("./src/models/MetaData");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await MetaData.deleteMany({});

    const data = [
      { type: "company", name: "ERP Pvt Ltd" },
      { type: "company", name: "Acme Solutions" },

      { type: "branch", name: "Mumbai", parent: "ERP Pvt Ltd" },
      { type: "branch", name: "Pune", parent: "ERP Pvt Ltd" },
      { type: "branch", name: "Delhi", parent: "Acme Solutions" },

      { type: "department", name: "IT", parent: "Mumbai" },
      { type: "department", name: "HR", parent: "Mumbai" },
      { type: "department", name: "Sales", parent: "Pune" },
      { type: "department", name: "Support", parent: "Delhi" }
    ];

    await MetaData.insertMany(data);
    console.log("✅ Meta data seeded");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
