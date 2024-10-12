const { URL } = require("../constants");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const filePath = path.join(__dirname, "../../json/program.json");

function findCategoryBySlug(slug) {
  const jsonData = fs.readFileSync(filePath, "utf8");
  let jsonArray = JSON.parse(jsonData);

  for (const [programSlug, program] of Object.entries(jsonArray)) {
    for (const [categorySlug, category] of Object.entries(program.kategorije)) {
      if (categorySlug === slug) {
        return category; // Return the found category
      }
    }
  }

  return null; // If category is not found
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/category/");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    const uniqueSuffix = req.body.slug;
    cb(null, uniqueSuffix + path.extname(file.originalname));
    const category = findCategoryBySlug(req.body.slug);
    if (category && category.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/category",
        category.imageName
      );
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting old image:", err);
        } else {
          console.log("Old image deleted successfully");
        }
      });
    }

    // Iterate through all programs and categories to find categories with the specified slug
    Object.entries(jsonArray).forEach(([programSlug, program]) => {
      Object.entries(program.kategorije).forEach(([categorySlug, category]) => {
        if (category.slug === req.body.slug) {
          category.imageName = uniqueSuffix + path.extname(file.originalname); // Update imageName
          category.image = `${URL}/uploads/category/${
            uniqueSuffix + path.extname(file.originalname)
          }`;
        }
      });
    });

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
  },
});

const uploadCategory = multer({ storage: multerStorage });

module.exports = uploadCategory;
