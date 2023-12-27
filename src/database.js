const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Client } = require('pg');
const POSTGRES_URL = process.env.POSTGRES_URL;
const oneDay = 1000 * 60 * 60 * 24;

const client = new Client({
    connectionString: POSTGRES_URL
});

const dbStore = new pgSession({
  tableName : 'session',
  conString: POSTGRES_URL,
});

const init = () => {
  console.log("Database init!");
  client.connect((err) => { 
    //Connected Database
    if (err) {
      console.log(err);
    } else {
      console.log("Data logging initiated!");
    }
  });

  return session({
      secret: "ABEGkZlkMAYjAgs-sJSPdqSRIMDoHg",
      saveUninitialized: true,
      resave: true,
      store: dbStore,
      cookie: { maxAge: oneDay }
  })
}
/**
 * 
 * @param {text: "sql query $1", values: ["value1"]} queryObj 
 * @returns 
 */
const query = async (queryObj) => {
  try{
    const res = await client.query(queryObj);
    // console.log("Query resp:", res);
    await client.end();
    return res?.rows[0];
  } catch (err) {
    console.log("Query resp:", err);
    await client.end();
  }
}

const updateUid = async (req, uid) => {
  
  let updateQuery = 'UPDATE session SET uid = $1 WHERE sid = "'+ req.sessionID + '"';
  let queryObj = {
    text: updateQuery,
    values: [uid]
  }
  // console.log("updateUid", queryObj);
  try{
    const res = await client.query(queryObj);
    await client.end();
    return res?.rows[0];
  } catch (err) {
    console.log("Query resp:", err);
    await client.end();
  }
}



module.exports = {init, dbStore, client, query, updateUid}
