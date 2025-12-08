const isDev = process.env.NODE_ENV !== "production";

export const cookieConfig = (maxAge) => ({
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true" ? true : false,
    sameSite: process.env.COOKIE_SAMESITE || (isDev ? "lax" : "none"),
    path: "/",
    maxAge,
});
