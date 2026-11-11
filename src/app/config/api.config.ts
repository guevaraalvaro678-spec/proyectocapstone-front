import { environment } from '../../environments/environment';

/** Local: http://localhost:5235/api (ng serve). Azure: "/api", porque el front va dentro del mismo App Service (ng build usa environment.prod.ts). */
export const API_URL = environment.apiUrl;

/** Dirección del servidor sin "/api": las imágenes subidas llegan como "/api/imagen/1". */
export const SERVIDOR = API_URL.replace(/\/api$/, '');

/** Convierte una ruta relativa del servidor ("/api/imagen/1") en una dirección completa; deja igual las http(s). */
export function urlServidor(ruta: string | null | undefined): string | null {
  if (!ruta) return null;
  return ruta.startsWith('/') ? `${SERVIDOR}${ruta}` : ruta;
}
