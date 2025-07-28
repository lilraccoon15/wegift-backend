const required = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(
            `La variable d'environnement ${name} doit être définie !`
        );
    }
    return value;
};

const config = {
    env: process.env.NODE_ENV || "development",

    jwtSecret: required("JWT_SECRET"),
    jwtAudience: process.env.JWT_AUDIENCE || "wegift-users",
    jwtIssuer: process.env.JWT_ISSUER || "wegift-auth-service",
    tokenExpirationMs: 60 * 60 * 1000, // 1h

    internalApiToken: required("INTERNAL_API_TOKEN"),

    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

export default config;
