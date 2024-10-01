const { Router } = require("express");
const fs = require("fs");
const aboutUpload = require("../multer/aboutStorage");
const filePath = "src/json/onama.json";

// POST route to upload a file
const aboutRouter = Router();
aboutRouter.post("/upload-about", aboutUpload.single("file"), (req, res) => {
  res.send("ok");
});

// POST route to update about information
aboutRouter.post("/about", (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);

    // Update fields with values from request body
    aboutData.headline = req.body.headline || aboutData.headline;
    aboutData.opis = req.body.opis || aboutData.opis;
    aboutData.items = req.body.items || aboutData.items;

    // Write updated data back to JSON file
    const updatedJsonData = JSON.stringify(aboutData, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error) {
    res.status(422).send("Nesto nije ok"); // Return a 422 status code on error
  }
});

// GET route to retrieve about information
aboutRouter.get("/about", (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);
    res.send(aboutData);
  } catch (error) {
    res.status(422).send("Nesto nije ok"); // Return a 422 status code on error
  }
});

module.exports = aboutRouter;
