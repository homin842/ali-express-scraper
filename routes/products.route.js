const express = require("express");
const utils = require("../utils");
const router = express.Router();
const { DatabaseService, AliExpressService } = require("../services");

const { pool } = require("../database");
const db = new DatabaseService(pool);
const aliExpress = new AliExpressService();

const aliExpressService = router.get("/", (req, res) => {
  try {
    // const result = db.find({
    //   tableName: "products",
    // })
    res.json({
      message: "Fetching products",
      data: [],
    });
  } catch (error) {
    res.status(400).send({
      message: "Error fetching products",
      error: error.message,
    });
  }
});

router.post("/seed/ali-express", async (req, res) => {
  try {
    await db.beginTransaction();

    const result = db.find({
      tableName: "products",
    });
    const saveProductPriceHistory = async (priceHistory, productId) => {
      const price_history_list = await Promise.all(
        (priceHistory ?? []).map(async (price) => {
          return await db.create({
            tableName: "price_history",
            data: {
              product_id: productId,
              price: price.price,
              created_at: price.date,
            },
          });
        }),
      );
      console.log(price_history_list);
    };

    function extractPriceFromString(str) {
      if (!str) {
        return 0;
      }
      // Regular expression to match the price format
      const regex = /₫\s?([\d,]+)/;

      // Extract the price from the string using the regular expression
      const match = str.match(regex);

      if (match) {
        // Extracted price with comma separated values
        const priceWithCommas = match[1];

        // Replace commas with periods to treat comma as a decimal separator
        const priceWithPeriod = priceWithCommas.replace(/,/g, ".");

        // Convert the price string to a float value
        const price = parseFloat(priceWithPeriod);

        return price;
      } else {
        // If no match found, return null or handle the case accordingly
        return 0;
      }
    }
    const saveShippings = async (shippings, productId) => {
      // const exampleShippings = [
      //   {
      //     tagStyleType: "default",
      //     tagContent: {
      //       tagStyle: {
      //         color: "#191919",
      //         position: "4",
      //       },
      //       displayTagType: "text",
      //       tagText: "Free shipping",
      //     },
      //     resourceCode: "searchItemCard",
      //     source: "Free_Shipping_atm",
      //     sellingPointTagId: "m0000064",
      //   },
      //   {
      //     tagStyleType: "default",
      //     tagContent: {
      //       tagStyle: {
      //         color: "#757575",
      //         position: "4",
      //       },
      //       displayTagType: "text",
      //       tagText: "+Shipping: ₫540,939",
      //     },
      //     resourceCode: "searchItemCard",
      //     source: "Shipping_Fee_atm",
      //     sellingPointTagId: "m0000056",
      //   },
      // ];
      await Promise.all(
        await (shippings ?? []).map(async (shipping) => {
          return await db.create({
            tableName: "shippings",
            data: {
              product_id: productId,
              shipping_type: shipping.source,
              shipping_price: extractPriceFromString(
                shipping.tagContent.tagText,
              ),
              tag_text: shipping.tagContent.tagText,
            },
          });
        }),
      );
    };

    const data = await aliExpress.scrapeProduct();
    const results = await Promise.all(
      data.map(async (aliProduct) => {
        const aliProductId = aliProduct.productId;
        const priceHistory = await aliExpress.scrapeProductPrice(aliProductId);
        const newProduct = await db.create({
          tableName: "products",
          data: {
            name: aliProduct.name,
            description: aliProduct.name,
            product_detail_url: aliProduct.productDetailUrl,
            image_url: aliProduct.image.imgUrl,
            rating: aliProduct.rating,
            shipping_type: aliProduct.shippingType,
            ali_express_product_id: aliProduct.productId,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        await saveProductPriceHistory(priceHistory, newProduct.id);
        await saveShippings(aliProduct.shippings, newProduct.id);
        return newProduct;
      }),
    );

    await db.commit();

    res.json({
      aliExpress: data,
      results,
    });
  } catch (error) {
    db.rollback();

    res.status(400).send({
      message: "Error seeding products",
      error: error.message,
    });
  }
});

router.post("/seed/ali-express/price-history", async (req, res) => {
  try {
    const data = await aliExpress.scrapeProduct();
    const results = await Promise.all(
      data.map(async (aliProduct) => {
        const aliProductId = aliProduct.productId;
        const priceHistory = await aliExpress.scrapeProductPrice(aliProductId);
        const product = await db.find({
          tableName: "products",
          condition: "WHERE ali_express_product_id = $1",
          values: [aliProductId],
        });
        if (product.length === 0) {
          return;
        }
        const productId = product[0].id;

        const price_history_list = await Promise.all(
          (priceHistory ?? []).map(async (price) => {
            const existing = await db.exists({
              tableName: "price_history",
              condition: "WHERE product_id = $1 AND created_at = $2",
              values: [productId, price.date],
            });
            if (!existing) {
              await db.create({
                tableName: "price_history",
                data: {
                  product_id: productId,
                  price: price.price,
                  created_at: price.date,
                },
              });
            }
          }),
        );
      }),
    );
    res.json({
      success: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "Error seeding price history",
      error: error.message,
    });
  }
});

module.exports = router;
