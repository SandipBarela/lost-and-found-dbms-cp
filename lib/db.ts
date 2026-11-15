import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

let pool: mysql.Pool;

const dbConfig: mysql.PoolOptions = {
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "lost_and_found_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

if (process.env.NODE_ENV === "production") {
  pool = mysql.createPool(dbConfig);
} else {
  if (!global._mysqlPool) {
    global._mysqlPool = mysql.createPool(dbConfig);
  }
  pool = global._mysqlPool;
}

export { pool };
export default pool;

