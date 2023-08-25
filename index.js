const express = require("express");
const mysql2 = require("mysql2");
const app= express();
app.use(express.json());
const db =  mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Gantait@9641.76#$',
    database: 'connect',
  });
  
  app.post('/createTablesAndData', async (req, res) => {
    try {
      // Create tables
      await createTables();
  
      // Insert data
      await insertData();
  
      res.json({ message: 'Tables created and data inserted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  async function createTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT  PRIMARY KEY,
        name VARCHAR(255)
      )
    `;
  
    const createCandidatesTable = `
      CREATE TABLE IF NOT EXISTS candidates (
        id INT  PRIMARY KEY,
        uid INT,
        candidateName VARCHAR(255),
        FOREIGN KEY (uid) REFERENCES users(id)
      )
    `;
  
    const createCandidateStatusTable = `
      CREATE TABLE IF NOT EXISTS candidate_status (
        id INT  PRIMARY KEY,
        cid INT,
        status VARCHAR(255),
        statusUpdatedAt DATE,
        FOREIGN KEY (cid) REFERENCES candidates(id)
      )
    `;
  
    await db.promise().query(createUsersTable);
    await db.promise().query(createCandidatesTable);
    await db.promise().query(createCandidateStatusTable);
  }
  
  async function insertData() {
    const insertUsersQuery = `
    INSERT INTO users (id, name)
    VALUES (?, ?)
  `;
  
  // Insert the first user
  await db.promise().query(insertUsersQuery, [4, 'Rohit']);
 // await db.promise().query(insertUsersQuery, [5, 'Sara']);
    // Insert candidates
    const insertCandidatesQuery = `
      INSERT INTO candidates (id,uid, candidateName)
      VALUES (4,4, 'Priyanka'), (5,4, 'Manish'), (6,4, 'Vedant')
    `;
    await db.promise().query(insertCandidatesQuery);
  
    // Insert candidate status
    const insertCandidateStatusQuery = `
      INSERT INTO candidate_status (id,cid, status, statusUpdatedAt)
      VALUES (7,4, 'joined', '2023-03-24'), (8,5, 'joined', '2022-12-12'), (9,6, 'interview', '2023-06-28')
    `;
    await db.promise().query(insertCandidateStatusQuery);
  }
  app.get("/",(req,res)=>{
    res.json("Hello this is backend");
  })

  app.get('/getUserData/:uid', async (req, res) => {
    try {
      const uid = req.params.uid;
      const userData = await getUserData(uid);
  
      res.json(userData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  //get the data
  async function getUserData(uid) {
    const getUserDataQuery = `
      SELECT u.id AS Uid, COUNT(c.id) AS TotalCandidates,
        SUM(CASE WHEN cs.status = 'joined' THEN 1 ELSE 0 END) AS Joined,
        SUM(CASE WHEN cs.status = 'interview' THEN 1 ELSE 0 END) AS Interview
      FROM users u
      LEFT JOIN candidates c ON u.id = c.uid
      LEFT JOIN candidate_status cs ON c.id = cs.cid
      WHERE u.id = ?
    `;
  
    const [userData] = await db.promise().query(getUserDataQuery, [uid]);
    return userData;
  }

app.listen(8800,()=>{
    console.log("Backend connected!!");
    db.connect((err) => {
      if (err) throw err;
      console.log('Connected to MySQL database');
    });
})