const multer = require("multer");
const path = require("path");
const fs = require("fs");

const filePath = "src/json/program.json";

function findCategoryBySlug(slug) {
  const jsonData = fs.readFileSync(filePath, "utf8");
  let jsonArray = JSON.parse(jsonData);

  // Iteriramo kroz sve programe i kategorije da pronađemo kategoriju po slugu
  for (const [programSlug, program] of Object.entries(jsonArray) as any) {
    for (const [categorySlug, category] of Object.entries(program.kategorije)) {
      if (categorySlug === slug) {
        return category; // Vraćamo pronađenu kategoriju
      }
    }
  }

  return null; // Ako kategorija nije pronađena
}

const multerStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/category/");
    return req;
  },
  filename: async (req: any, file: any, cb: any) => {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    const uniqueSuffix = req.body.slug;
    cb(null, uniqueSuffix + path.extname(file.originalname));
    const category = findCategoryBySlug(req.body.slug) as any;
    if (category && category.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/category",
        category.imageName
      );
      fs.unlink(oldFilePath, (err: any) => {
        if (err) {
          console.error("Error deleting old image:", err);
        } else {
          console.log("Old image deleted successfully");
        }
      });
    }
    // Iteriramo kroz sve programe i kategorije da pronađemo kategorije sa zadatim slugom
    Object.entries(jsonArray).forEach(([programSlug, program]: any) => {
      Object.entries(program.kategorije).forEach(
        ([categorySlug, category]: any) => {
          if (category.slug === req.body.slug) {
            category.imageName = uniqueSuffix + path.extname(file.originalname); // Ažuriramo imageName
            category.image = `http://localhost:3000/uploads/product/${
              uniqueSuffix + path.extname(file.originalname)
            }`;
          }
        }
      );
    });

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");

    // const cat = await Category.findOne({ where: { id: req.body.id } });

    // if (cat && cat.imageName) {
    //   const oldFilePath = path.join(
    //     __dirname,
    //     "../../uploads/category",
    //     cat.imageName
    //   );
    //   fs.unlink(oldFilePath, (err: any) => {
    //     if (err) {
    //       console.error("Error deleting old image:", err);
    //     } else {
    //       console.log("Old image deleted successfully");
    //     }
    //   });
    // }
    // const uniqueSuffix = req.body.id + "-" + req.body.slug;
    // cb(null, uniqueSuffix + path.extname(file.originalname));

    // await Category.update(
    //   {
    //     image: `http://localhost:3000/uploads/category/${
    //       uniqueSuffix + path.extname(file.originalname)
    //     }`,
    //     imageName: uniqueSuffix + path.extname(file.originalname),
    //   },
    //   {
    //     where: {
    //       id: req.body.id,
    //     },
    //   }
    // );
    // return {
    //   ...req.body,
    //   fileName: uniqueSuffix + path.extname(file.originalname),
    // };
    return {};
  },
});

const uploadCategory = multer({ storage: multerStorage });

export { uploadCategory };
