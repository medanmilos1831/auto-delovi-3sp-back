const { Router } = require("express");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../json/kontakt.json");

// POST route to update contact information
const kontakRouter = Router();
kontakRouter.post("/kontakt", async (req, res) => {
  try {
    // Update fields with values from request body, defaulting to null if not provided
    req.sharedData.kontakt.facebook = req.body.facebook || null;
    req.sharedData.kontakt.instagram = req.body.instagram || null;
    req.sharedData.kontakt.phone = req.body.phone || null;
    req.sharedData.kontakt.email = req.body.email || null;
    req.sharedData.kontakt.adresa = req.body.adresa || null;
    req.sharedData.kontakt.coordinate = req.body.coordinate || null;
    req.sharedData.kontakt.radnimDanima = req.body.radnimDanima || null;
    req.sharedData.kontakt.subotom = req.body.subotom || null;
    req.sharedData.kontakt.nedeljom = req.body.nedeljom || null;

    // Write updated data back to JSON file
    const updatedJsonData = JSON.stringify(req.sharedData.kontakt, null, 2);
    await fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error) {
    res.status(500).send(error.message); // Return a 500 status code on error
  }
});

// GET route to retrieve contact information
kontakRouter.get("/kontakt", async (req, res) => {
  try {
    console.log("usao u kontakt");
    res.send(req.sharedData.kontakt);
  } catch (error) {
    console.log("erro u kontakt", error);
    res.status(500).send(error.message); // Return a 500 status code on error
  }
});

module.exports = kontakRouter;
