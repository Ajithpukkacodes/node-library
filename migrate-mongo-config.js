// In this file you can configure migrate-mongo

var dev_db_url = 'mongodb://127.0.0.1';
var mongoDB = process.env.MONGODB_URI || dev_db_url;
var db_name = (process.env.NODE_ENV == 'production') ? "lib_production" : "lib_development" ;
const config = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    url: mongoDB,

    // TODO Change this to your database name:
    databaseName: db_name,

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog"
};

// Return the config as a promise
module.exports = config;
