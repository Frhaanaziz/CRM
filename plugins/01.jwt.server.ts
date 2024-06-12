import jwt from 'jsonwebtoken';

export default defineNuxtPlugin(() => {
    const { JWT_SECRET } = useRuntimeConfig();
    const sign = (payload: any) => jwt.sign(payload, JWT_SECRET);
    return {
        provide: {
            signJwtToken: sign,
        },
    };
});
