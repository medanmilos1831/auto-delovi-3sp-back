const express = require("express");
const nodemailer = require("nodemailer");
const xlsx = require("xlsx");
const slugify = require("slugify");
const multer = require("multer");
const { Router } = require("express");
const cors = require("cors");
const prismic = require("@prismicio/client");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

console.log("ssssss", process.env.NODE_ENV);

const app = express();

app.use(cors());
app.use(express.json());
const writeClient = prismic.createWriteClient(process.env.PRISMIC_SPACE, {
  writeToken: process.env.PRISMIC_WRITE_TOKEN,
});
const client = prismic.createClient(process.env.PRISMIC_SPACE, {
  // If your repository is private, add an access token
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const migration = prismic.createMigration();
const zika = Router();
zika.post("/pocetna/excel", upload.single("file"), async (req, res) => {
  var programs = [];
  var category = [];
  let programMap = {};
  let categoryMap = {};
  try {
    const e = await client.getAllByType("program");
    programs = e.map((i) => i.uid);
  } catch (error) {}
  try {
    const e = await client.getAllByType("category");
    category = e.map((i) => i.uid);
  } catch (error) {}
  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet from the Excel file
    const worksheet = workbook.Sheets[sheetName];

    // Parse the Excel sheet to JSON format
    const json = xlsx.utils.sheet_to_json(worksheet);
    for (let i = 0; i < json.length; i++) {
      if (
        !programs.includes(
          json[i].ARTIKAL_ID > 50000 && json[i].ARTIKAL_ID < 60000
            ? "traktorski-program"
            : "auto-program"
        )
      ) {
        let doc = migration.createDocument(
          {
            type: "program",
            uid:
              json[i].ARTIKAL_ID > 50000 && json[i].ARTIKAL_ID < 60000
                ? "traktorski-program"
                : "auto-program",
            lang: "en-us",
            data: {
              title: [
                {
                  type: "heading6",
                  text:
                    json[i].ARTIKAL_ID > 50000 && json[i].ARTIKAL_ID < 60000
                      ? "Traktorski program"
                      : `Auto program`,
                },
              ],
            },
          },
          json[i].ARTIKAL_ID > 50000 && json[i].ARTIKAL_ID < 60000
            ? "Traktorski program"
            : `Auto program`
        );
        programMap[
          json[i].ARTIKAL_ID > 50000 && json[i].ARTIKAL_ID < 60000
            ? "traktorski-program"
            : "auto-program"
        ] = doc;
      }
      programs.push(
        json[i].ARTIKAL_ID > 50000 && json[i].ARTIKAL_ID < 60000
          ? "traktorski-program"
          : "auto-program"
      );
    }

    await writeClient.migrate(migration, {
      reporter: (event) => console.log(event),
    });

    for (let i = 0; i < json.length; i++) {
      if (!category.includes(json[i].NAZIV.split(" ")[0].toLowerCase())) {
        let doccat = migration.createDocument(
          {
            type: "category",
            uid: json[i].NAZIV.split(" ")[0].toLowerCase(),
            lang: "en-us",
            data: {
              title: [
                {
                  type: "heading6",
                  text: json[i].NAZIV.split(" ")[0].toLowerCase(),
                },
              ],
            },
          },
          json[i].NAZIV.split(" ")[0].toLowerCase()
        );
        categoryMap[json[i].NAZIV.split(" ")[0].toLowerCase()] = doccat;
      }
      category.push(json[i].NAZIV.split(" ")[0].toLowerCase());
    }

    await writeClient.migrate(migration, {
      reporter: (event) => console.log(event),
    });

    for (let i = 0; i < json.length; i++) {
      migration.createDocument(
        {
          type: "product",
          uid: `${json[i].ARTIKAL_ID}-${slugify(json[i].NAZIV, {
            lower: true,
          })}`,
          lang: "en-us",
          data: {
            title: [
              {
                type: "heading6",
                text: json[i].NAZIV,
              },
            ],
            program:
              programMap[
                json[i].ARTIKAL_ID > 50000 && json[i].ARTIKAL_ID < 60000
                  ? "traktorski-program"
                  : "auto-program"
              ],
            category: categoryMap[json[i].NAZIV.split(" ")[0].toLowerCase()],
            price: json[i].PRODAJNA_SA_PDV,
            napomena: [
              {
                type: "paragraph",
                text: json[i].NAPOMENA ? `${json[i].NAPOMENA}` : "",
              },
            ],
            proizvodjac: [
              {
                type: "paragraph",
                text: json[i].PROIZVODJAC ? `${json[i].PROIZVODJAC}` : "",
              },
            ],
            kataloski_broj: [
              {
                type: "paragraph",
                text: json[i].SIF_PROIZVODJACA
                  ? `${json[i].SIF_PROIZVODJACA}`
                  : "",
              },
            ],
            jm: [
              {
                type: "paragraph",
                text: json[i].JM ? `${json[i].JM}` : "",
              },
            ],
            pak: [
              {
                type: "paragraph",
                text: json[i].PAK ? `${json[i].PAK}` : "",
              },
            ],
          },
        },
        `${json[i].NAZIV} ${json[i].ARTIKAL_ID}`
      );
    }

    await writeClient.migrate(migration, {
      reporter: (event) => {
        // console.log("event", event);
        // console.log("doc", event.data.document);
      },
    });

    res.send("ok");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

zika.post("/naruci", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "srba3sp@gmail.com",
        pass: "pdoy mngj pzwz gcpn",
      },
    });
    const formatter = new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "RSD",
    });
    const items = req.body.products
      .map(
        (item) => `
      <tr>
        <td>${item.product.data.title[0].text}</td>
        <td>${item.qty}</td>
        <td>${formatter.format(item.product.data.price)}</td>
        <td>${item.product.data.kataloski_broj[0].text}</td>
      </tr>
    `
      )
      .join("");
    const htmlContent = `
      <p>Detalji narudžbe su prikazani ispod:</p>
      <span>Kontakt mail: ${
        req.body.email ? req.body.email : "Korisnik nije ostavio email"
      }<span/>
      <br />
      <span>Kontakt telefon: ${
        req.body.phone ? req.body.phone : "Korisnik nije ostavio telefon"
      }<span/>
      <br />
      <h3><b>Komentar korisnika: ${
        req.body.comment ? req.body.comment : "Korisnik nije ostavio komentar"
      }</b><h3/>
      <br />
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>Proizvod</th>
            <th>Količina</th>
            <th>Cena</th>
            <th>Kataloski broj</th>
          </tr>
        </thead>
        <tbody>
          ${items}
        </tbody>
      </table>
    `;
    const mailOptions = {
      from: req.body.email,
      to: "srba3sp@gmail.com",
      subject: `Nova narudžba od ${req.body.email}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    return res.send("Narudžba uspešno poslana!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Došlo je do greške prilikom slanja narudžbe.");
  }
});

app.use(zika);

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
