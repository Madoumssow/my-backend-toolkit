// Interface minimale compatible avec mysql2/promise et pg (poolClient)
export interface SqlTransactionalClient {
    query(sql: string, params?: any[]): Promise<any>;
    release(): void;
}

export interface SqlConnectionPool {
    getConnection?(): Promise<SqlTransactionalClient>; // Format mysql2
    connect?(): Promise<SqlTransactionalClient>; //Format pg (PostgreSQL)
}

export async function withSqlTransaction<T>(
    pool: SqlConnectionPool,
    callback: (client: SqlTransactionalClient) => Promise<T>
): Promise<T> {
    // Récupère une connexion dédiée depuis le pool (MySQL ou PostgreSQL)
    const client = pool.getConnection
        ? await pool.getConnection()
        : pool.connect
        ? await pool.connect()
        : null;

    if (!client) {
        throw new Error("Pool SQL invalid : méthode getConnexion() ou connect() manquante.");
    }

    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        // Libère toujours la connexion dans le pool, même en cas de crash
        client.release();
    }
}