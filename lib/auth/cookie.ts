/**
 * Nombre de la cookie de sesión de Payload (prefijo por defecto: "payload").
 * Vive aislado en su propio módulo para que el middleware (edge runtime)
 * pueda importarlo sin arrastrar el bundle de Payload/Node.
 */
export const AUTH_COOKIE = 'payload-token'
