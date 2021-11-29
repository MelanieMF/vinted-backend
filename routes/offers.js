const express = require("express");
const router = express.Router();

const Offer = require("../models/Offer");

const cloudinary = require("cloudinary");

const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.fields);
    // console.log(req.files.picture.path);

    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ETAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
      owner: req.user,
    });

    const result = await cloudinary.uploader.upload(req.files.picture.path);
    newOffer.product_image = result;

    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offers", async (req, res) => {
  // console.log(Number(req.query.price));
  try {
    const limitToShow = 6;
    const sort = req.query.sort.replace("price-", "");
    let priceMax = req.query.priceMax;
    let priceMin = req.query.priceMin;
    let pageToSkip = Number(req.query.page) * limitToShow;
    if (!pageToSkip) {
      pageToSkip = 0;
    }
    const filter = {};
    if (req.query.product_name) {
      filter.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin && req.query.priceMax) {
      filter.product_price = {
        $lte: Number(priceMax),
        $gte: Number(priceMin),
      };
    } else if (req.query.priceMin) {
      filter.product_price = {
        $gte: Number(priceMin),
      };
    } else if (req.query.priceMax) {
      filter.product_price = {
        $gte: Number(priceMax),
      };
    }

    const offers = await Offer.find(filter)
      .populate("owner.account")
      .limit(limitToShow)
      .skip(pageToSkip)
      .sort(sort)
      .select("product_name product_price");
    res.json(filter);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

module.exports = router;
