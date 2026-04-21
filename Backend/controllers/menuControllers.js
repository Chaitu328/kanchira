const Product = require("../models/products");
const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Banner = require("../models/banner");
const Offer = require("../models/offer");
const Logo = require("../models/logo");
const Category = require("../models/categories");

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      subcategoryId,
      subsubcategoryId,
      brand,
      tags,
      speciality,
      variants,
      images,
      slug,
      metaTitle,
      metaDescription,
      discountPercentage,
      url,
      image,
      galleryImages,
    } = req.body;

    // Lowercase check to prevent duplicates
    const nameLower = name.trim().toLowerCase();

    const existingProduct = await Product.findOne({
      name: new RegExp(`^${nameLower}$`, "i"),
    });

    if (existingProduct) {
      return res.status(200).json({
        responseCode: 400,
        message: "Product already exists with the same name",
      });
    }

    // ✅ Fetch category name
    const category = await Category.findById(categoryId);
    const categoryName = category?.name || "X";
    const categoryInitial = categoryName.charAt(0).toUpperCase();

    // ✅ Size enum mapping
    const sizeMap = {
      XS: "XS",
      S: "S",
      M: "M",
      L: "L",
      XL: "XL",
      XXL: "XXL",
      "FREE SIZE": "FS",
      "ONE SIZE": "OS",
      NONE: "N",
    };

    const getSizeCode = (size) => {
      const key = (size || "").trim().toUpperCase();
      return sizeMap[key] || "SZ";
    };

    const getColorCode = (color) => {
      if (!color || typeof color !== "string") return "XXX";
      return color.trim().replace(/\s+/g, "").toUpperCase().substring(0, 3);
    };

    const generateSKU = (size, color) => {
      const sizeCode = getSizeCode(size);
      const colorCode = getColorCode(color);
      const random4Digit = Math.floor(1000 + Math.random() * 9000);
      return `K${categoryInitial}${sizeCode}${colorCode}${random4Digit}`;
    };

    // ✅ Assign SKUs
    if (Array.isArray(variants)) {
      variants.forEach((variant) => {
        const color = variant.color;
        if (Array.isArray(variant.sizes)) {
          variant.sizes.forEach((size) => {
            size.sku = generateSKU(size.size, color);
          });
        }
      });
    }

    // ✅ Optional: Auto-calculate final price if not set
    variants?.forEach((variant) => {
      variant.sizes?.forEach((size) => {
        if (!size.finalPrice && size.price) {
          const discount = size.discountPercentage || 0;
          size.finalPrice = size.price - (size.price * discount) / 100;
        }
      });
    });

    // ✅ Save product
    const product = new Product({
      name,
      description,
      categoryId,
      subcategoryId,
      subsubcategoryId,
      brand,
      tags,
      speciality,
      variants,
      images,
      slug,
      metaTitle,
      metaDescription,
      discountPercentage,
      url,
      image,
      galleryImages,
    });

    const savedProduct = await product.save();

    res.status(201).json({
      responseCode: 200,
      message: "Product added successfully",
      savedProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      responseCode: 500,
      message: "Failed to create product",
      error: error.message,
    });
  }
};
// exports.createProduct = async (req, res) => {
//   try {
//     const {
//       name,
//       description,
//       categoryId,
//       subcategoryId,
//       subsubcategoryId,
//       brand,
//       tags,
//       speciality,
//       variants,
//       images,
//       slug,
//       metaTitle,
//       metaDescription,
//       discountPercentage,
//       url,
//       image
//     } = req.body;

//     // Convert name to lowercase for case-insensitive comparison
//     const nameLower = name.trim().toLowerCase();

//     // Check if a category with the same name exists (case-insensitive)
//     const existingProduct = await Product.findOne({ name: new RegExp(`^${nameLower}$`, "i") });

//     if (existingProduct) {
//       return res.status(200).json({ responseCode: 400, message: "Product already exists with the same name" });
//     }

//     const product = new Product({
//       name,
//       description,
//       categoryId,
//       subcategoryId,
//       subsubcategoryId,
//       brand,
//       tags,
//       speciality,
//       variants,
//       images,
//       slug,
//       metaTitle,
//       metaDescription,
//       discountPercentage,
//       url,
//       image
//     });

//     const savedProduct = await product.save();

//     res.status(201).json({ responseCode: 200, message: "Product Add Successfully", savedProduct });
//   } catch (error) {
//     console.error('Error creating product:', error);
//     res.status(500).json({ error: 'Failed to create product', msg: error.message });
//   }
// };

// POST /products/filter
// exports.search = async (req, res) => {
//   try {
//     const {
//       name,
//       brand,
//       speciality,
//       tags,
//       color,
//       size,
//       minPrice,
//       maxPrice,
//       minDiscount,
//       maxDiscount
//     } = req.body;

//     const query = {};

//     if (name) {
//       query.name = { $regex: name, $options: 'i' };
//     }

//     if (brand) {
//       query.brand = { $regex: brand, $options: 'i' };
//     }

//     if (speciality) {
//       query.speciality = speciality;
//     }

//     if (tags) {
//       const tagArray = Array.isArray(tags) ? tags : tags.split(',');
//       query.tags = { $in: tagArray };
//     }

//     if (color || size || minPrice || maxPrice || minDiscount || maxDiscount) {
//       query.variants = {
//         $elemMatch: {
//           ...(color && { color: { $regex: color, $options: 'i' } }),
//           ...(size || minPrice || maxPrice || minDiscount || maxDiscount
//             ? {
//               sizes: {
//                 $elemMatch: {
//                   ...(size && { size }),
//                   ...(minPrice && { price: { $gte: parseFloat(minPrice) } }),
//                   ...(maxPrice && {
//                     price: {
//                       ...((minPrice && { $gte: parseFloat(minPrice) }) || {}),
//                       $lte: parseFloat(maxPrice)
//                     }
//                   }),
//                   ...(minDiscount && { discountPercentage: { $gte: parseFloat(minDiscount) } }),
//                   ...(maxDiscount && {
//                     discountPercentage: {
//                       ...((minDiscount && { $gte: parseFloat(minDiscount) }) || {}),
//                       $lte: parseFloat(maxDiscount)
//                     }
//                   })
//                 }
//               }
//             }
//             : {})
//         }
//       };
//     }

//     const products = await Product.find(query);
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

exports.search = async (req, res) => {
  try {
    const {
      name,
      brand,
      speciality,
      tags,
      color, // now expecting array like ["Red", "Blue"]
      size,
      minPrice,
      maxPrice,
      minDiscount,
      maxDiscount,
      subcategoryId,
      subsubCategoryId,
    } = req.body;

    const pipeline = [];

    const matchStage = {
      isDeleted: false,
      ...(subcategoryId && {
        subcategoryId: new mongoose.Types.ObjectId(subcategoryId),
      }),
      ...(subsubCategoryId && {
        subsubcategoryId: new mongoose.Types.ObjectId(subsubCategoryId),
      }),
      ...(name && { name: { $regex: name, $options: "i" } }),
      // ✅ Multi-brand filter
      ...(brand &&
        Array.isArray(brand) &&
        brand.length > 0 && {
          brand: { $in: brand.map((b) => new RegExp(b, "i")) },
        }),
      ...(speciality && { speciality }),
      ...(tags && {
        tags: { $in: Array.isArray(tags) ? tags : tags.split(",") },
      }),
    };

    pipeline.push({ $match: matchStage });

    // ✅ Filter variants by colorCode array
    pipeline.push({
      $addFields: {
        variants: {
          $filter: {
            input: "$variants",
            as: "variant",
            cond: {
              $and: [
                ...(Array.isArray(color) && color.length > 0
                  ? [{ $in: ["$$variant.colorCode", color] }]
                  : []),
                { $gt: [{ $size: "$$variant.sizes" }, 0] },
              ],
            },
          },
        },
      },
    });

    // ✅ Filter sizes within variants
    pipeline.push({
      $addFields: {
        variants: {
          $map: {
            input: "$variants",
            as: "variant",
            in: {
              $mergeObjects: [
                "$$variant",
                {
                  sizes: {
                    $filter: {
                      input: "$$variant.sizes",
                      as: "sizeObj",
                      cond: {
                        $and: [
                          size ? { $eq: ["$$sizeObj.size", size] } : {},
                          minPrice
                            ? {
                                $gte: ["$$sizeObj.price", parseFloat(minPrice)],
                              }
                            : {},
                          maxPrice
                            ? {
                                $lte: ["$$sizeObj.price", parseFloat(maxPrice)],
                              }
                            : {},
                          minDiscount
                            ? {
                                $gte: [
                                  "$$sizeObj.discountPercentage",
                                  parseFloat(minDiscount),
                                ],
                              }
                            : {},
                          maxDiscount
                            ? {
                                $lte: [
                                  "$$sizeObj.discountPercentage",
                                  parseFloat(maxDiscount),
                                ],
                              }
                            : {},
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    });

    // ✅ Remove products that have no matching variants/sizes
    pipeline.push({
      $match: {
        "variants.0": { $exists: true },
        "variants.sizes.0": { $exists: true },
      },
    });

    const products = await Product.aggregate(pipeline);

    res.status(200).json(products);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { subsubcategoryId } = req.body;

    if (!subsubcategoryId) {
      return res.status(400).json({
        responseCode: 400,
        message: "Subsubcategory ID is required.",
      });
    }

    const products = await Product.find({ subsubcategoryId })
      .populate("categoryId", "name") // ✅ only populate `name`
      .populate("subcategoryId", "name") // ✅ only populate `name`
      .populate("subsubcategoryId", "name"); // ✅ only populate `name`

    return res.status(200).json({
      responseCode: 200,
      message: "Products fetched successfully.",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      responseCode: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { minDiscount, maxDiscount } = req.query;

    let matchStage = {
      isDeleted: false,
    };

    // 🔥 FILTER BY DISCOUNT RANGE
    if (minDiscount || maxDiscount) {
      matchStage["variants.sizes.discountPercentage"] = {};

      if (minDiscount) {
        matchStage["variants.sizes.discountPercentage"].$gte =
          Number(minDiscount);
      }

      if (maxDiscount) {
        matchStage["variants.sizes.discountPercentage"].$lte =
          Number(maxDiscount);
      }
    }

    const products = await Product.find(matchStage);

    res.status(200).json({
      responseCode: 200,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      responseCode: 500,
      error: "Failed to fetch products",
    });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { bannerImage } = req.body;

    const banners = await Banner({
      bannerImage,
    });
    await banners.save();

    res
      .status(200)
      .json({ responseCode: 200, message: "Banner Added Successfully" });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res
      .status(500)
      .json({ responseCode: 500, error: "Failed to fetch menu items" });
  }
};
exports.updateLogo = async (req, res) => {
  try {
    const { _id, logo } = req.body;

    const banners = await Logo.findByIdAndUpdate(_id, { logo }, { new: true });

    if (!banners) {
      return res
        .status(200)
        .json({ responseCode: 404, message: "Logo not found" });
    }
    res
      .status(200)
      .json({ responseCode: 200, message: " Logo updated Successfully" });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res
      .status(500)
      .json({ responseCode: 500, error: "Failed to fetch menu items" });
  }
};

exports.getLogo = async (req, res) => {
  try {
    const banners = await Logo.findOne();
    res.status(200).json({ responseCode: 200, logo: banners });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res
      .status(500)
      .json({ responseCode: 500, error: "Failed to fetch menu items" });
  }
};
exports.getBanner = async (req, res) => {
  try {
    const banners = await Banner.findOne();

    res.status(200).json({
      responseCode: 200,
      _id: banners._id,
      banners: banners.bannerImage,
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res
      .status(500)
      .json({ responseCode: 500, error: "Failed to fetch menu items" });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { _id, bannerImage } = req.body;

    const banners = await Banner.findByIdAndUpdate(
      _id,
      { bannerImage },
      { new: true },
    );

    if (!banners) {
      return res
        .status(200)
        .json({ responseCode: 404, message: "Banners not found" });
    }

    res
      .status(200)
      .json({ responseCode: 200, message: "Banner Updated Successfully" });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res
      .status(500)
      .json({ responseCode: 500, error: "Failed to fetch menu items" });
  }
};

exports.createOffer = async (req, res) => {
  try {
    const { name, code, startDate, expiryDate, description } = req.body;
    const offer = await Offer.findOne({ code });
    console.log(offer);
    if (offer) {
      return res.status(200).json({ message: "Name With Offer Already Exist" });
    }

    const offers = await Offer({
      name,
      code,
      startDate,
      expiryDate,
      description,
    });

    await offers.save();

    res
      .status(200)
      .json({ responseCode: 200, message: "Offer Created Successfully" });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res
      .status(500)
      .json({ responseCode: 500, error: "Failed to fetch menu items" });
  }
};
exports.getOffer = async (req, res) => {
  try {
    const offers = await Offer.find();

    res.status(200).json({ responseCode: 200, offers });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res
      .status(500)
      .json({ responseCode: 500, error: "Failed to fetch menu items" });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const { _id, name, description, startDate, expiryDate, code } = req.body;

    const offers = await Offer.findByIdAndUpdate(
      _id,
      { name, description, startDate, expiryDate, code },
      { new: true },
    );

    if (!offers) {
      return res
        .status(200)
        .json({ responseCode: 404, message: "Banners not found" });
    }

    res
      .status(200)
      .json({ responseCode: 200, message: "Offer Updated Successfully" });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res
      .status(500)
      .json({ responseCode: 500, error: "Failed to fetch menu items" });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const { _id } = req.body;

    const offers = await Offer.findByIdAndDelete(_id);

    if (!offers) {
      return res
        .status(200)
        .json({ responseCode: 404, message: "Banners not found" });
    }

    res
      .status(200)
      .json({ responseCode: 200, message: "Offer Delete Successfully" });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res
      .status(500)
      .json({ responseCode: 500, error: "Failed to fetch menu items" });
  }
};
exports.getByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res
        .status(200)
        .json({ responseCode: 400, message: "Product ID is required" });
    }

    // Fetch the product with populated category info
    const product = await Product.findById(productId)
      .populate("categoryId", "name") // ✅ Populate category name
      .populate("subcategoryId", "name") // ✅ Populate subcategory name
      .populate("subsubcategoryId", "name"); // ✅ Populate subsubcategory name

    if (!product) {
      return res.status(200).json({
        responseCode: 200,
        message: "Product not found",
        product: null,
      });
    }

    res.status(200).json({
      responseCode: 200,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({
      responseCode: 500,
      error: "Failed to fetch product",
    });
  }
};

exports.getBycategory = async (req, res) => {
  try {
    const { categoryId } = req.body; // Accepts categoryId and userId as query params

    if (!categoryId) {
      return res
        .status(200)
        .json({ responseCode: 400, message: "Category ID is required" });
    }

    // Fetch all menu items under the given category
    const products = await Product.find({ categoryId });

    if (!products.length) {
      return res.status(200).json({
        responseCode: 200,
        message: "No items found in this category",
        products: products,
      });
    }

    res.status(201).json({ message: "Products fetched succesfully", products });
  } catch (error) {
    res.status(500).json({ message: " Internal  server error" });
  }
};

exports.updatedProduct = async (req, res) => {
  try {
    const {
      _id,
      name,
      description,
      categoryId,
      subcategoryId,
      brand,
      tags,
      speciality,
      variants,
      images,
      slug,
      metaTitle,
      metaDescription,
      discountPercentage,
      available,
      url,
      image,
    } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      {
        name,
        description,
        categoryId,
        subcategoryId,
        brand,
        tags,
        speciality,
        variants,
        images,
        slug,
        metaTitle,
        metaDescription,
        discountPercentage,
        available,
        url,
        image,
      },
      { new: true },
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ responseCode: 404, message: "Product not found" });
    }

    res.status(200).json({
      responseCode: 200,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ error: "Failed to update product", message: error.message });
  }
};

// Delete Category Item
exports.deleteProduct = async (req, res) => {
  try {
    const { _id } = req.body;

    const deletedCategory = await Product.findByIdAndDelete(_id);

    if (!deletedCategory) {
      return res
        .status(200)
        .json({ responseCode: 404, message: "Product not found" });
    }

    res
      .status(200)
      .json({ responseCode: 200, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete Product" });
  }
};

exports.getProductsByCategorySubcategorySubsubcategory = async (req, res) => {
  try {
    const { categoryId, subcategoryId, subsubcategoryId } = req.body;

    // Build the query based on provided parameters
    const query = {};
    if (categoryId) query.categoryId = categoryId;
    if (subcategoryId) query.subcategoryId = subcategoryId;
    if (subsubcategoryId) query.subsubcategoryId = subsubcategoryId;

    // Fetch products based on the constructed query
    const products = await Product.find(query);

    res.status(200).json({ responseCode: 200, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ responseCode: 500, error: "Failed to fetch products" });
  }
};

exports.getProductsBySubsubcategoryId = async (req, res) => {
  try {
    const { subsubcategoryId } = req.body;

    // Build the query based on provided parameters

    // Fetch products based on the constructed query
    const products = await Product.find({ subsubcategoryId });

    res.status(200).json({ responseCode: 200, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ responseCode: 500, error: "Failed to fetch products" });
  }
};
