module.exports = {
  apps: [
    {
      name: "auto-delovi-3sp-back", // Ime tvoje aplikacije
      script: "./src/index.js", // Putanja do start fajla tvoje aplikacije
      env: {
        NODE_ENV: "development", // Ovo se koristi za dev okruženje
        PORT: 3001,
      },
      env_file: ".env.development", // Ovdje PM2 učitava varijable za dev okruženje
    },
    {
      name: "auto-delovi-3sp-back-prod", // Druga aplikacija za production okruženje
      script: "./src/index.js",
      env: {
        NODE_ENV: "production", // Ovo se koristi za prod okruženje
        PORT: 3000,
      },
      env_file: ".env.production", // PM2 učitava varijable za prod okruženje
    },
  ],
};
