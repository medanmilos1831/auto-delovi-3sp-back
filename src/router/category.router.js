const express = require("express");
const uploadCategory = require("../multer/categoryStorage");

const categoryRoute = express.Router();

// POST route to upload a category file
categoryRoute.post(
  "/upload-category",
  uploadCategory.single("file"),
  (req, res) => {
    res.send("ok");
  }
);
// GET route to retrieve products and category details
categoryRoute.get("/category/:program/:category", (req, res) => {
  try {
    let jsonArray = req.sharedData.program;

    const program = jsonArray[req.params.program];
    if (!program) {
      return res.send({
        products: [],
        category: null,
      });
    }
    const cat = program.kategorije[req.params.category];
    if (!cat) {
      return res.send({
        products: [],
        category: null,
      });
    }
    return res.send({
      products: Object.values(cat.prozivodi),
      ...(() => {
        const { prozivodi, ...rest } = cat;
        return { ...rest };
      })(),
    });
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

module.exports = categoryRoute; // Use export default
