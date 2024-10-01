const { Router } = require("express");
const fs = require("fs/promises");
const path = require("path");
const aboutUpload = require("../multer/aboutStorage");

// POST route to upload a file
const aboutRouter = Router();
aboutRouter.post("/upload-about", aboutUpload.single("file"), (req, res) => {
  res.send("ok");
});

// POST route to update about information
aboutRouter.post("/about", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../json/onama.json");
    const jsonData = await fs.readFile(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);

    // Update fields with values from request body
    aboutData.headline = req.body.headline || aboutData.headline;
    aboutData.opis = req.body.opis || aboutData.opis;
    aboutData.items = req.body.items || aboutData.items;

    // Write updated data back to JSON file
    const updatedJsonData = JSON.stringify(aboutData, null, 2);
    await fs.writeFile(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error) {
    console.log("eeee", error);
    res.status(422).send("Nesto nije ok"); // Return a 422 status code on error
  }
});

// GET route to retrieve about information
aboutRouter.get("/about", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../json/onama.json");

    const jsonData = await fs.readFile(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);
    res.send(aboutData);
  } catch (error) {
    console.log("eeee", error);
    res.status(422).send(error); // Return a 422 status code on error
  }
});

module.exports = aboutRouter;
