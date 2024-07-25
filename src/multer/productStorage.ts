const filePath = "src/json/program.json";
const multer = require("multer");
const path = require("path");
const fs = require("fs");

function findProductBySlug(slug) {
  const jsonData = fs.readFileSync(filePath, "utf8");
  let jsonArray = JSON.parse(jsonData) as any;

  // Iteriramo kroz sve programe i kategorije da pronađemo proizvod po slugu
  for (const [programSlug, program] of Object.entries(jsonArray)) {
    for (const [categorySlug, category] of Object.entries(
      (program as any).kategorije
    )) {
      if ((category as any).prozivodi && (category as any).prozivodi[slug]) {
        return (category as any).prozivodi[slug]; // Vraćamo pronađeni proizvod
      }
    }
  }

  return null; // Ako proizvod nije pronađen
}

function updateProductImageName(slug, imageName, image) {
  const jsonData = fs.readFileSync(filePath, "utf8");
  let jsonArray = JSON.parse(jsonData);

  // Iteriramo kroz sve programe i kategorije da pronađemo proizvode sa zadatim slugom
  Object.entries(jsonArray).forEach(([programSlug, program]: any) => {
    Object.entries(program.kategorije).forEach(
      ([categorySlug, category]: any) => {
        if (category.prozivodi && category.prozivodi[slug]) {
          category.prozivodi[slug].imageName = imageName; // Ažuriramo imageName
          category.prozivodi[slug].image = image;
        }
      }
    );
  });

  const updatedJsonData = JSON.stringify(jsonArray, null, 2);
  fs.writeFileSync(filePath, updatedJsonData, "utf8");
}

const multerStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/product/");
    return req;
  },
  filename: async (req: any, file: any, cb: any) => {
    const uniqueSuffix = req.body.slug;
    cb(null, uniqueSuffix + path.extname(file.originalname));
    const product = findProductBySlug(req.body.slug);
    if (product && product.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/product",
        product.imageName
      );
      fs.unlink(oldFilePath, (err: any) => {
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
      `http://localhost:3000/uploads/product/${
        uniqueSuffix + path.extname(file.originalname)
      }`
    );
    return {};
  },
});

const uploadProduct = multer({ storage: multerStorage });

export { uploadProduct };
