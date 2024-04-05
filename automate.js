const cron = require("cron");
const axios = require("axios");

const job = new cron.CronJob("0 0 0 * * *", async () => {
  try {
    // Make API call to /products/seed/ali-express endpoint
    // Replace this with your actual API call implementation
    const response = await axios.post(
      "/products/seed/ali-express/price-history",
    );
    console.log("API call to /products/seed/ali-express successful:", response);
  } catch (error) {
    console.error("Error making API call:", error);
  }
});

job.start();
