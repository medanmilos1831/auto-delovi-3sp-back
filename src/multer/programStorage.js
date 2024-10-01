const { x } = require("../constants");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const filePath = "src/json/program.json";

// Function to find a program by slug
function findProgramBySlug(slug) {
  const jsonData = fs.readFileSync(filePath, "utf8");
  let jsonArray = JSON.parse(jsonData);

  // Iterate through all programs to find the program by slug
  for (const [programSlug, program] of Object.entries(jsonArray)) {
    if (programSlug === slug) {
      return program; // Return the found program
    }
  }

  return null; // If program not found
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/program/");
  },
  filename: (req, file, cb) => {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    const uniqueSuffix = req.body.slug;
    cb(null, uniqueSuffix + path.extname(file.originalname));
    const program = findProgramBySlug(req.body.slug);

    if (program && program.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/program",
        program.imageName
      );
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting old image:", err);
        } else {
          console.log("Old image deleted successfully");
        }
      });
    }

    // Update imageName and image for the program
    Object.entries(jsonArray).forEach(([programSlug, program]) => {
      if (program.slug === req.body.slug) {
        program.imageName = uniqueSuffix + path.extname(file.originalname); // Update imageName
        program.image = `${x.URL}/uploads/program/${
          uniqueSuffix + path.extname(file.originalname)
        }`;
      }
    });

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
  },
});

const uploadProgram = multer({ storage: multerStorage });

module.exports = uploadProgram; // Change this line
