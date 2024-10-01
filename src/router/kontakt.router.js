const { Router } = require("express");
const fs = require("fs");

const filePath = "src/json/kontakt.json";

// POST route to update contact information
const kontakRouter = Router();
kontakRouter.post("/kontakt", (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
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
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error) {
    res.status(500).send(error.message); // Return a 500 status code on error
  }
});

// GET route to retrieve contact information
kontakRouter.get("/kontakt", (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);
    res.send(aboutData);
  } catch (error) {
    res.status(500).send(error.message); // Return a 500 status code on error
  }
});

module.exports = kontakRouter;
