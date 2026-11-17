import mongoose, { Schema} from "mongoose";
import { withSqlTransaction, SqlConnectionPool, SqlTransactionalClient } from "./sql.transaction";
import { connectMongoWithRetry, cleanJsonPlugin } from "./mongo.connection";

describe("06-database-sql-nosql : Transactions SQL & Connexion MongoDB", () => {
    it("doit exécuter BEGIN, la requêt, COMMIT et libérer la connexion si tout réussit", async () => {
        const mockClient: SqlTransactionalClient = {
            query: jest.fn().mockResolvedValue({ rows: [] }),
            release: jest.fn(),
        };
        const mockPool: SqlConnectionPool = {
            getConnection: jest.fn().mockResolvedValue(mockClient),
        };

        const result = await withSqlTransaction(mockPool, async (client) => {
            await client.query("INSERT INTO orders (total) VALUES (?)", [5000]);
            return "ORDER_CREATED";
        });

        expect(result).toBe("ORDER_CREATED");
        expect(mockClient.query).toHaveBeenNthCalledWith(1, "BEGIN");
        expect(mockClient.query).toHaveBeenNthCalledWith(2, "INSERT INTO orders (total) VALUES (?)", [5000]);
        expect(mockClient.query).toHaveBeenNthCalledWith(3, "COMMIT");
        expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it("doit exécuter ROLLBACK et libérer la connexion si une erreur survient dans la transaction", async () => {
        const mockClient: SqlTransactionalClient = {
            query: jest.fn().mockResolvedValue({}),
            release: jest.fn(),
        };
        const mockPool: SqlConnectionPool = {
            connect: jest.fn().mockResolvedValue(mockClient),
        };

        await expect(
            withSqlTransaction(mockPool, async () => {
                throw new Error("Stock insuffisant");
            })
        ).rejects.toThrow("Stock insuffisant");

        expect(mockClient.query).toHaveBeenNthCalledWith(1, "BEGIN");
        expect(mockClient.query).toHaveBeenNthCalledWith(2, "ROLLBACK");
        expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it("doit réessayer la connexion MongoDB en cas d'échec temporaire", async () => {
        const connectSpy = jest
            .spyOn(mongoose, "connect")
            .mockRejectedValueOnce(new Error("Timeout réseau"))
            .mockResolvedValueOnce(mongoose);

        const conn = await connectMongoWithRetry({
            uri: "mongodb://localhost:27017/test",
            maxRetries: 3,
            retryDelayMS: 10,
        });

        expect(conn).toBe(mongoose);
        expect(connectSpy).toHaveBeenCalledTimes(2);
        connectSpy.mockRestore();
    });

    it("doit nettoyer _id, __v et password via le plugin Mongoose cleanJsonPlugin", () => {
        const userSchema = new Schema({ email: String, password: String});
        userSchema.plugin(cleanJsonPlugin);
        const TestUser = mongoose.model("TestUser", userSchema);
        
        const doc = new TestUser({ email: "dev@test.com", password: "secret_password" });
        const json = doc.toJSON() as Record<string, any>;

        expect(json.id).toBeDefined();
        expect(json._id).toBeUndefined();
        expect(json.__v).toBeUndefined();
        expect(json.password).toBeUndefined();
    });
});