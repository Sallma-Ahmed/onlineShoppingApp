// Import required modules
const mysql2 = require("mysql2");

//Dependency Inversion Principle (DIP)
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "salma",
  database: "e-shopping",
  port: "3300"
};

// Create a class with(SRP) to handle database connections.
class Database {
  constructor() {
    this.connection = mysql2.createConnection(dbConfig);
  }

  connect(callback) {
    this.connection.connect(callback);
  }

  disconnect(callback) {
    this.connection.end(callback);
  }
}

// Export a new instance of the Database class
module.exports = new Database().connection;