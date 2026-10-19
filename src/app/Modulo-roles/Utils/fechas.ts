/** Ayudas para mostrar y convertir fechas. El backend siempre trabaja en UTC; aquí se pasa a la hora local. */

const dos = (n: number) => String(n).padStart(2, '0');

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/** "Lunes 21 de setiembre" */
export function fechaLarga(iso: string): string {
  const texto = new Date(iso).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  return mayuscula(texto);
}

/** "9:00 a. m." */
export function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' });
}

/** "21/09/2026 9:00 a. m." */
export function fechaHora(iso: string): string {
  const d = new Date(iso);
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} ${hora(iso)}`;
}

/** "2026-09-21", en la hora local: sirve para agrupar horarios por día. */
export function claveDia(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

/** Convierte una fecha ISO (UTC) al formato que espera <input type="datetime-local">, en hora local. */
export function aInputLocal(iso: string): string {
  const d = new Date(iso);
  return `${claveDia(iso)}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

/** Convierte el valor de un <input type="datetime-local"> (hora local) a ISO en UTC. */
export function deInputLocal(valor: string): string {
  return new Date(valor).toISOString();
}

/** Tiempo restante hasta la fecha, en palabras cortas: "en 3 h", "mañana", "hace 2 días". */
export function relativa(iso: string): string {
  const horas = Math.round((new Date(iso).getTime() - Date.now()) / 3_600_000);

  if (horas < -24) return `hace ${Math.round(-horas / 24)} días`;
  if (horas < 0) return `hace ${-horas} h`;
  if (horas < 1) return 'en menos de 1 h';
  if (horas < 24) return `en ${horas} h`;
  if (horas < 48) return 'mañana';
  return `en ${Math.round(horas / 24)} días`;
}
