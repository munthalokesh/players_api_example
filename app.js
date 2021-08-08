const express = require("express");
const path = require("path");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
app.use(express.json());

//get all players api

const intializeServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Sever Started Successfully");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

intializeServer();
let convertToObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get("/players/", async (request, response) => {
  const getquery = `SELECT * FROM cricket_team
    ORDER BY player_id;`;
  const players = await db.all(getquery);
  response.send(players.map((singlePlayer) => convertToObject(singlePlayer)));
});

//get a player api

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  let wantedPlayer = await db.get(query);
  response.send(convertToObject(wantedPlayer));
});

//post player details api

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const query = `INSERT INTO cricket_team (player_name,jersey_number,role)
  VALUES ("${playerName}",${jerseyNumber},"${role}");`;
  const dbresponse = await db.run(query);
  response.send("Player Added to Team");
});
//update a player query
app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = playerDetails;
  const query = `UPDATE cricket_team SET player_name="${playerName}",
  jersey_number=${jerseyNumber},role="${role}"
  WHERE player_id=${playerId};`;

  const dbresponse = await db.run(query);
  response.send("Player Details Updated");
});

//delete a player query

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  db.run(query);
  response.send("Player Removed");
});

module.exports = app;
