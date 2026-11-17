import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";

export interface JwtUserPayload {
    userId: string;
    email: string;
    role: string;
}

export interface AuthSecretsConfig {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn?: SignOptions["expiresIn"];
    refreshExpiresIn?: SignOptions["expiresIn"];
}

export class AuthService {
    private readonly saltRounds = 10;

    constructor(private readonly config: AuthSecretsConfig) {}
    
        // 1. Hachage sécurisé du mot de passe avant sauvegarde en base
        async hashPassword(plainPassword: string): Promise<string> {
            return bcrypt.hash(plainPassword, this.saltRounds);
        }
    
        // 2. Comparaison lors de la connexion (login)
        async comparePassword(plainPassword: string, hashPassword: string): Promise<boolean> {
            return bcrypt.compare(plainPassword, hashPassword);
        }

        // 3. Génération d'un Access Token (courte durée, ex: 15 min)
        generateAccessToken(payload: JwtUserPayload): string {
            return jwt.sign(payload, this.config.accessSecret, {
                expiresIn: this.config.accessExpiresIn ?? "15m",
            });
        }

        // 4. Génération d'un Refresh Token (longue durée, ex: 7 jours)
        generateRefreshToken(payload: Pick<JwtUserPayload, "userId">): string {
            return jwt.sign(payload, this.config.refreshSecret, {
                expiresIn: this.config.refreshExpiresIn ?? "7d",
            });
        }

        // 5. Vérification et décodage de l'Aceess Token
        verifyAccessToken(token: string): JwtUserPayload {
            return jwt.verify(token, this.config.accessSecret) as JwtUserPayload;
        }

        // 6. Vérification et décodage du Refresh Token
        verifyRefreshToken(token: string): Pick<JwtUserPayload, "userId"> {
            return jwt.verify(token, this.config.refreshSecret) as Pick<JwtUserPayload, "userId">;
        }
}
