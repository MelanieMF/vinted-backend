const express = require("express");
const router = express.Router();

const Offer = require("../models/Offer");
const User = require("../models/User");

const cloudinary = require("cloudinary");

const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    console.log(req.fields);
    console.log(req.files.picture.path);

    const newOffer = new Offer({
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ETAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
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
    const limitToShow = 12;
    const sort = req.query.sort; // .replace("price-", "")
    let priceMax = req.query.priceMax;
    let priceMin = req.query.priceMin;
    let skip = Number(req.query.skip) * limitToShow;
    if (!skip) {
      skip = 0;
    }
    let filters = {};
    if (req.query.product_name) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin && req.query.priceMax) {
      filters.product_price = {
        $lte: Number(priceMax),
        $gte: Number(priceMin),
      };
    } else if (req.query.priceMin) {
      filters.product_price = {
        $gte: Number(priceMin),
      };
    } else if (req.query.priceMax) {
      filters.product_price = {
        $gte: Number(priceMax),
      };
    }

    const offers = await Offer.find(filters)
      .populate({
        path: "owner",
        select: "account",
      })
      .limit(limitToShow)
      .skip(skip)
      .sort(sort);
    // .select("product_name product_price");
    const count = await Offer.countDocuments(filters);

    res.json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: { message: error.message } });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username account.phone account.avatar",
    });
    res.json(offer);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
