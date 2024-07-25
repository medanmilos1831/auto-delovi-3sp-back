const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const filePath = "../json/program.json";

// Funkcija za pronalaženje programa po slugu
function findProgramBySlug(slug) {
  const jsonData = fs.readFileSync(filePath, "utf8");
  let jsonArray = JSON.parse(jsonData);

  // Iteriramo kroz sve programe da pronađemo program po slugu
  for (const [programSlug, program] of Object.entries(jsonArray)) {
    if (programSlug === slug) {
      return program; // Vraćamo pronađeni program
    }
  }

  return null; // Ako program nije pronađen
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/program/");
  },
  filename: async (req, file, cb) => {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    const uniqueSuffix = req.body.slug;
    cb(null, uniqueSuffix + path.extname(file.originalname));
    const program = findProgramBySlug(req.body.slug) as any;

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

    // Ažuriramo imageName i image za program
    Object.entries(jsonArray).forEach(([programSlug, program]: any) => {
      if (program.slug === req.body.slug) {
        program.imageName = uniqueSuffix + path.extname(file.originalname); // Ažuriramo imageName
        program.image = `http://localhost:3000/uploads/program/${
          uniqueSuffix + path.extname(file.originalname)
        }`;
      }
    });

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
  },
});

const uploadProgram = multer({ storage: multerStorage });
export { uploadProgram };
