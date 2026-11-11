import { Injectable, signal } from '@angular/core';

const CLAVE_TEMA = 'tema';

/**
 * Modo claro u oscuro (HU-33). El tema inicial lo pone un script en index.html antes de que cargue Angular
 * (preferencia guardada o, si no hay, la del sistema operativo), así la página no parpadea al abrir.
 * Es una preferencia visual de cada navegador: se guarda en localStorage, no en el servidor.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly oscuro = signal(document.documentElement.dataset['tema'] === 'oscuro');

  alternar(): void {
    const oscuro = !this.oscuro();
    this.oscuro.set(oscuro);
    document.documentElement.dataset['tema'] = oscuro ? 'oscuro' : 'claro';
    try {
      localStorage.setItem(CLAVE_TEMA, oscuro ? 'oscuro' : 'claro');
    } catch {
      // Navegación privada o almacenamiento bloqueado: el cambio vale solo para esta visita.
    }
  }
}
