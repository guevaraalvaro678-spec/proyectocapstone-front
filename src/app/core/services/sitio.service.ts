import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_URL } from '../config/api.config';
import { ImagenSubida, Iniciativa, IniciativaGuardar, SitioPublico } from '../models/sitio.model';

/** Las imágenes vienen del backend con una ruta relativa (/api/imagen/1): aquí se vuelven absolutas. */
const SERVIDOR = API_URL.replace(/\/api$/, '');
const absoluta = (url: string | null): string | null => (url ? `${SERVIDOR}${url}` : null);
const conUrl = (i: Iniciativa): Iniciativa => ({ ...i, imagenUrl: absoluta(i.imagenUrl) });

/** Logo e iniciativas del sitio público, editables por el administrador. */
@Injectable({ providedIn: 'root' })
export class SitioService {
  private readonly http = inject(HttpClient);

  /** Lo que muestra el sitio público; se refresca con `cargar()`. */
  readonly sitio = signal<SitioPublico>({ logoUrl: null, iniciativas: [] });

  cargar(): void {
    this.http.get<SitioPublico>(`${API_URL}/sitio`).subscribe({
      next: (s) =>
        this.sitio.set({ logoUrl: absoluta(s.logoUrl), iniciativas: s.iniciativas.map(conUrl) }),
      error: () => {
        // Sin conexión el sitio sigue funcionando con el logo de texto y sin iniciativas.
      },
    });
  }

  // ---- Administrador ----

  subirImagen(archivo: File): Observable<ImagenSubida> {
    const datos = new FormData();
    datos.append('archivo', archivo);
    return this.http
      .post<ImagenSubida>(`${API_URL}/imagen`, datos)
      .pipe(map((i) => ({ ...i, url: absoluta(i.url)! })));
  }

  guardarLogo(imagenId: number | null): Observable<void> {
    return this.http.put<void>(`${API_URL}/sitio/logo`, { imagenId });
  }

  listarIniciativas(): Observable<Iniciativa[]> {
    return this.http.get<Iniciativa[]>(`${API_URL}/iniciativa`).pipe(map((lista) => lista.map(conUrl)));
  }

  crearIniciativa(datos: IniciativaGuardar): Observable<Iniciativa> {
    return this.http.post<Iniciativa>(`${API_URL}/iniciativa`, datos);
  }

  actualizarIniciativa(id: number, datos: IniciativaGuardar): Observable<Iniciativa> {
    return this.http.put<Iniciativa>(`${API_URL}/iniciativa/${id}`, datos);
  }

  eliminarIniciativa(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/iniciativa/${id}`);
  }
}
