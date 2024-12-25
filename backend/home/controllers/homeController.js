const { getDB } = require("../../utils/dbConnection");

const getHomeData = (req, res) => {
  const db = getDB();
  db.all("SELECT * FROM Users", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
};

module.exports = { getHomeData };
