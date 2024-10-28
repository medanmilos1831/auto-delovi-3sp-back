const express = require("express");
const slugify = require("slugify");
const uploadCategory = require("../multer/categoryStorage");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../json/program.json");

const categoryRoute = express.Router();

// POST route to upload a category file
categoryRoute.post(
  "/upload-category",
  uploadCategory.single("file"),
  (req, res) => {
    res.send("ok");
  }
);

// POST route to add a new category
categoryRoute.post("/category", (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    let slug = slugify(req.body.naziv, {
      lower: true,
      strict: true,
    });

    // Function to check if a key exists in any program's categories
    function checkForKey(jsonObj, keyToCheck) {
      for (const key in jsonObj) {
        if (jsonObj[key].kategorije && jsonObj[key].kategorije[keyToCheck]) {
          return true;
        }
      }
      return false;
    }

    const keyExists = checkForKey(jsonArray, slug);
    if (keyExists) {
      throw {
        code: 422,
        message: "vec postoji kategorija",
      };
    }

    const { programId, ...rest } = req.body;
    programId.forEach((i) => {
      jsonArray[i].kategorije[slug] = {
        ...jsonArray[i].kategorije[slug],
        slug,
        ...rest,
        prozivodi: {},
        image: null,
        imageName: null,
      };
    });

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// PUT route to update a category
categoryRoute.put("/category/:id", (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    const { naziv, caption, desc, programId } = req.body;
    const oldCategoryId = req.params.id;

    // Generating slug from naziv
    const newCategorySlug = slugify(naziv, {
      lower: true,
      strict: true,
    });

    let isNameChanged = false;
    let currentCategory = null;

    // Iterate through all programs and categories to find the current category
    Object.entries(jsonArray).forEach(([programSlug, program]) => {
      Object.entries(program.kategorije).forEach(([categorySlug, category]) => {
        if (categorySlug === oldCategoryId) {
          currentCategory = category;
          if (category.naziv !== naziv) {
            isNameChanged = true;
          }
        }
      });
    });

    if (!currentCategory) {
      throw new Error("Category not found");
    }

    // Check if the new name already exists if the name is changed
    if (isNameChanged) {
      let nameExists = false;

      Object.entries(jsonArray).forEach(([programSlug, program]) => {
        Object.entries(program.kategorije).forEach(
          ([categorySlug, category]) => {
            if (categorySlug === newCategorySlug) {
              nameExists = true;
            }
          }
        );
      });

      if (nameExists) {
        throw new Error("Category slug already exists");
      }

      // Update category name in categories
      Object.entries(jsonArray).forEach(([programSlug, program]) => {
        if (program.kategorije[oldCategoryId]) {
          const categoryData = { ...program.kategorije[oldCategoryId] };
          delete program.kategorije[oldCategoryId];
          program.kategorije[newCategorySlug] = categoryData;
        }
      });
    }

    // Update category information
    Object.entries(jsonArray).forEach(([programSlug, program]) => {
      if (program.kategorije[newCategorySlug]) {
        program.kategorije[newCategorySlug] = {
          ...program.kategorije[newCategorySlug],
          naziv: naziv,
          caption: caption,
          desc: desc,
        };
      }
    });

    // Remove category from programs that are no longer in the programId list
    Object.entries(jsonArray).forEach(([programSlug, program]) => {
      if (
        program.kategorije[newCategorySlug] &&
        !programId.includes(programSlug)
      ) {
        delete program.kategorije[newCategorySlug];
      }
    });

    // Add category to new programs from the programId list
    programId.forEach((newProgramSlug) => {
      if (jsonArray[newProgramSlug]) {
        jsonArray[newProgramSlug].kategorije[newCategorySlug] = {
          slug: newCategorySlug,
          naziv: naziv,
          caption: caption,
          desc: desc,
          prozivodi: currentCategory.prozivodi || {},
          imageName: currentCategory.imageName,
          image: currentCategory.image,
        };
      }
    });

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// DELETE route to remove a category
categoryRoute.delete("/category/:id", (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    Object.entries(jsonArray).forEach(([programSlug, program]) => {
      if (program.kategorije && program.kategorije[req.params.id]) {
        delete program.kategorije[req.params.id];
      }
    });

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// GET route to retrieve all categories
categoryRoute.get("/category", (req, res) => {
  try {
    let jsonArray = req.sharedData.program;
    // const jsonData = fs.readFileSync(filePath, "utf8");
    // let jsonArray = JSON.parse(jsonData);

    function extractUniqueCategoriesWithProgram(jsonData) {
      const uniqueCategories = [];

      // Function to copy object without prozivodi field
      function copyWithoutProducts(obj) {
        const { prozivodi, ...rest } = obj;
        return rest;
      }

      // Iterate through each program
      Object.entries(jsonData).forEach(([programSlug, program]) => {
        // Iterate through categories in each program
        Object.entries(program.kategorije).forEach(
          ([categorySlug, category]) => {
            // Check if the category already exists in uniqueCategories by slug
            const existingCategory = uniqueCategories.find(
              (cat) => cat.slug === category.slug
            );
            if (!existingCategory) {
              // If the category does not exist, add it to uniqueCategories
              uniqueCategories.push({
                ...copyWithoutProducts(category),
                program: [{ value: program.slug, label: program.naziv }],
              });
            } else {
              // If the category already exists, add { value: program.slug, label: program.naziv } to the program array
              existingCategory.program.push({
                value: program.slug,
                label: program.naziv,
              });
            }
          }
        );
      });

      return uniqueCategories;
    }

    res.send(extractUniqueCategoriesWithProgram(jsonArray));
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// GET route to retrieve products and category details
categoryRoute.get("/category/:program/:category", (req, res) => {
  try {
    let jsonArray = req.sharedData.program;
    // const jsonData = fs.readFileSync(filePath, "utf8");
    // let jsonArray = JSON.parse(jsonData);

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
