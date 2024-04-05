const cheerio = require("cheerio");
const axios = require("axios");
const _ = require("lodash");

class AliExpressService {
  // Function to format date as YYYY-MM-DD
  formatDate(dateString) {
    // Split the date string into components
    let parts = dateString.split("/");

    // Ensure proper formatting of month and day (adding leading zeros if necessary)
    let month = parts[0].padStart(2, "0");
    let day = parts[1].padStart(2, "0");
    let year = parts[2];

    // Return the formatted date string
    return new Date(`${year}-${month}-${day}`);
  }

  extractPriceHistory(html) {
    // Load HTML into cheerio
    const $ = cheerio.load(html);

    // Find the table containing the price history
    let table = $(".pcex table");

    // Initialize an empty array to store the scraped data
    let priceHistory = [];

    // If the table is found
    if (table) {
      // Iterate over each row in the table (skipping the header row)
      let rows = table.find("tr");
      for (let i = 1; i < rows.length; i++) {
        let row = $(rows[i]);
        let cells = row.find("td");

        // Extract date and price from each row
        let date = $(cells[0]).text().trim();
        let price = $(cells[1]).text().trim();

        // Format date as YYYY-MM-DD
        let formattedDate = this.formatDate(date);

        // Remove any non-numeric characters from the price using regex
        const formattedPrice = parseFloat(
          price.replace(/[^\d.,]/g, "").replace(",", "."),
        );

        // Add date and price to the price history array
        if (!isNaN(formattedPrice)) {
          priceHistory.push({
            date: formattedDate,
            price: formattedPrice,
          });
        }
      }
    }

    return priceHistory;
  }

  async scrapeProduct() {
    const url = "https://vi.aliexpress.com/fn/search-pc/index";
    const payload = {
      pageVersion: "ff8ad60b0a0d1fbfc9e484ea303a7f44",
      target: "root",
      data: {
        isFromCategory: "n",
        categoryUrlParams:
          '{"q":"Laptops","s":"qp_nw","osf":"category_navigate","sg_search_params":"","guide_trace":"7f7fd741-d0a3-4195-84cd-5c6f1adab566","scene_id":"37749","searchBizScene":"openSearch","recog_lang":"en","bizScene":"category_navigate","guideModule":"category_navigate_vertical","postCatIds":"7,21","scene":"category_navigate"}',
        page: 1,
        g: "y",
        SearchText: "Laptops",
        origin: "y",
      },
      eventName: "onChange",
      dependency: [],
    };
    const { data } = await axios.post(url, payload);
    const itemList = data.data.result.mods.itemList.content;
    function simplifyProductData(products) {
      const simplifiedProducts = [];
      for (const product of products) {
        const simplifiedProduct = {
          name: product.title.displayTitle,
          prices: product.prices,
          productType: product.productType,
          image: product.image,
          productDetailUrl: product.productDetailUrl,
          rating: product.evaluation?.starRating,
          store: product.store,
          shippings: product.sellingPoints,
          productId: product.productId,
        };
        simplifiedProducts.push(simplifiedProduct);
      }
      return simplifiedProducts;
    }
    return simplifyProductData(itemList);
  }

  async scrapeProductPrice(aliProductId) {
    try {
      const url = `https://www.pricearchive.org/aliexpress.com/item/${aliProductId}`;
      // Fetch the HTML content
      const response = await fetch(url);

      // If the response is not okay (status code other than 200), throw an error
      if (!response.ok) {
        console.error("Failed to fetch HTML" + aliProductId);
        return;
      }

      // Read the response text as HTML
      const html = await response.text();

      // // Return the HTML content
      const priceHistory = this.extractPriceHistory(html);
      return priceHistory;
    } catch (error) {
      // Handle errors (e.g., log or throw)
      console.error("Error fetching HTML:", error);
    }
  }
}

module.exports = AliExpressService;
