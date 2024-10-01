const { Router } = require("express");
const fs = require("fs/promises");
const path = require("path");

const filePath = path.join(__dirname, "../json/kontakt.json");

// POST route to update contact information
const kontakRouter = Router();
kontakRouter.post("/kontakt", async (req, res) => {
  try {
    const jsonData = await fs.readFile(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);

    // Update fields with values from request body, defaulting to null if not provided
    aboutData.facebook = req.body.facebook || null;
    aboutData.instagram = req.body.instagram || null;
    aboutData.phone = req.body.phone || null;
    aboutData.email = req.body.email || null;
    aboutData.adresa = req.body.adresa || null;
    aboutData.coordinate = req.body.coordinate || null;
    aboutData.radnimDanima = req.body.radnimDanima || null;
    aboutData.subotom = req.body.subotom || null;
    aboutData.nedeljom = req.body.nedeljom || null;

    // Write updated data back to JSON file
    const updatedJsonData = JSON.stringify(aboutData, null, 2);
    await fs.writeFile(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error) {
    res.status(500).send(error.message); // Return a 500 status code on error
  }
});

// GET route to retrieve contact information
kontakRouter.get("/kontakt", async (req, res) => {
  try {
    const jsonData = await fs.readFile(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);
    res.send(aboutData);
  } catch (error) {
    res.status(500).send(error.message); // Return a 500 status code on error
  }
});

module.exports = kontakRouter;
