class DatabaseService {
  constructor(pool, schemaName = "public") {
    this.schemaName = schemaName;
    this.pool = pool;
  }

  async query(query, values) {
    const result = await this.pool.query(query, values);
    return result;
  }

  async count(options) {
    const { tableName, condition = "", values } = options;
    const sql = `SELECT COUNT(*) FROM ${this.schemaName}.${tableName} ${condition}`;
    const result = await this.pool.query(sql, values);
    return result.rows[0].count;
  }

  async find(options) {
    const {
      tableName,
      condition = "",
      fields = "*",
      offset = undefined,
      limit = undefined,
      values = undefined,
    } = options;

    // fields can be "*" or list of fields [col1, col2]
    const sql = `SELECT ${fields === "*" ? "*" : fields.join(", ")}
                FROM ${this.schemaName}.${tableName} 
                ${condition}
                ${offset ? `OFFSET ${offset}` : ""} ${limit ? `LIMIT ${limit}` : ""}`;
    const result = await this.pool.query(sql, values);
    return result.rows;
  }

  async create(options) {
    const { tableName, data } = options;

    // Insert one record
    if (!Array.isArray(data)) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
      const sql = `INSERT INTO ${this.schemaName}.${tableName} (${keys.join(", ")}) VALUES (${placeholders}) RETURNING *`;
      const result = await this.pool.query(sql, values);
      return result.rows[0];
    } else {
      if (data.length === 0) {
        console.warn("No data to insert");
        return [];
      }
      const keys = Object.keys(data[0]);
    }
  }

  async delete(options) {
    const { tableName, condition } = options;
    const sql = `DELETE FROM ${this.schemaName}.${tableName} ${condition}`;
    const result = await this.pool.query(sql);
    return result.rowCount;
  }

  async beginTransaction() {
    return this.pool.query("BEGIN");
  }

  async commit() {
    return this.pool.query("COMMIT");
  }

  async rollback() {
    return this.pool.query("ROLLBACK");
  }

  async exists(options) {
    const { tableName, condition, values } = options;
    if (!condition) {
      throw new Error("Missing condition");
    }
    const sql = `SELECT EXISTS(SELECT 1 FROM ${this.schemaName}.${tableName} ${condition})`;
    const result = await this.pool.query(sql, values);
    if (!result || !result.rows) {
      return false;
    }
    return result.rows[0].exists;
  }
}

module.exports = DatabaseService;
