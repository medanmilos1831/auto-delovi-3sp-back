const { URL } = require("../constants");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const filePath = path.join(__dirname, "../../json/program.json");

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
    const uploadPath = path.join(__dirname, "../../uploads/program/");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    const uniqueSuffix = req.body.slug;
    cb(null, uniqueSuffix + path.extname(file.originalname));
    const program = findProgramBySlug(req.body.slug);

    // if (program && program.imageName) {
    //   const oldFilePath = path.join(
    //     __dirname,
    //     "../uploads/program",
    //     program.imageName
    //   );
    //   fs.unlink(oldFilePath);
    // }

    // Update imageName and image for the program
    Object.entries(jsonArray).forEach(([programSlug, program]) => {
      if (program.slug === req.body.slug) {
        program.imageName = uniqueSuffix + path.extname(file.originalname); // Update imageName
        program.image = `${URL}/uploads/program/${
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
