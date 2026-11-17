import mongoose, { Schema } from "mongoose";

export interface MongoConnectOptions {
    uri: string;
    maxRetries?: number;
    retryDelayMS?: number;
}

export async function connectMongoWithRetry(options: MongoConnectOptions): Promise<typeof mongoose> {
    const maxRetries = options.maxRetries ?? 3;
    const retryDelayMS = options.retryDelayMS ?? 2000;

    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            attempt++;
            return await mongoose.connect(options.uri, {
                serverSelectionTimeoutMS: 5000,
            });
        } catch (error) {
            if (attempt >= maxRetries) {
                throw new Error(`Échec de connexion MongoDB après ${maxRetries} tentatives : ${(error as Error).message}`);
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelayMS));
        }
    }

    throw new Error("Erreur inattendue lors de la connexion MongoDB");
}

// Plugin Mongoose réutilisable : nettoie les réponse JSON (_id -> id, supprime __v et password)
export function cleanJsonPlugin(schema: Schema): void {
    schema.set("toJSON", {
        virtuals: true,
        versionKey: false,
        transform: (_doc, ret) => {
            delete ret._id;
            delete ret.password;
            return ret;
        },
    });
}