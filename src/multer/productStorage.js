const { x } = require("../constants");
const filePath = "src/json/program.json";
const multer = require("multer");
const path = require("path");
const fs = require("fs");

function findProductBySlug(slug) {
  const jsonData = fs.readFileSync(filePath, "utf8");
  let jsonArray = JSON.parse(jsonData);

  // Iterate through all programs and categories to find the product by slug
  for (const [programSlug, program] of Object.entries(jsonArray)) {
    for (const [categorySlug, category] of Object.entries(program.kategorije)) {
      if (category.prozivodi && category.prozivodi[slug]) {
        return category.prozivodi[slug]; // Return the found product
      }
    }
  }

  return null; // If product not found
}

function updateProductImageName(slug, imageName, image) {
  const jsonData = fs.readFileSync(filePath, "utf8");
  let jsonArray = JSON.parse(jsonData);

  // Iterate through all programs and categories to find products with the specified slug
  Object.entries(jsonArray).forEach(([programSlug, program]) => {
    Object.entries(program.kategorije).forEach(([categorySlug, category]) => {
      if (category.prozivodi && category.prozivodi[slug]) {
        category.prozivodi[slug].imageName = imageName; // Update imageName
        category.prozivodi[slug].image = image;
      }
    });
  });

  const updatedJsonData = JSON.stringify(jsonArray, null, 2);
  fs.writeFileSync(filePath, updatedJsonData, "utf8");
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/product/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = req.body.slug;
    cb(null, uniqueSuffix + path.extname(file.originalname));
    const product = findProductBySlug(req.body.slug);
    if (product && product.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/product",
        product.imageName
      );
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting old image:", err);
        } else {
          console.log("Old image deleted successfully");
        }
      });
    }
    updateProductImageName(
      req.body.slug,
      uniqueSuffix + path.extname(file.originalname),
      `${x.URL}/uploads/product/${
        uniqueSuffix + path.extname(file.originalname)
      }`
    );
  },
});

const uploadProduct = multer({ storage: multerStorage });

module.exports = uploadProduct;
