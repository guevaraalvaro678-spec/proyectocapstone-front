import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_URL, urlServidor } from '../../config/api.config';
import {
  ImagenSubida,
  Iniciativa,
  IniciativaGuardar,
  IniciativaPropuesta,
  SitioPublico,
  YapeGuardar,
} from '../Models/sitio.model';

/** Las imágenes vienen del backend con una ruta relativa (/api/imagen/1): aquí se vuelven absolutas. */
const conUrl = (i: Iniciativa): Iniciativa => ({ ...i, imagenUrl: urlServidor(i.imagenUrl) });

/** Logo e iniciativas del sitio público, editables por el administrador. */
@Injectable({ providedIn: 'root' })
export class SitioService {
  private readonly http = inject(HttpClient);

  /** Lo que muestra el sitio público; se refresca con `cargar()`. */
  readonly sitio = signal<SitioPublico>({ logoUrl: null, iniciativas: [], yape: null });

  cargar(): void {
    this.http.get<SitioPublico>(`${API_URL}/sitio`).subscribe({
      next: (s) =>
        this.sitio.set({
          logoUrl: urlServidor(s.logoUrl),
          iniciativas: s.iniciativas.map(conUrl),
          yape: s.yape ? { ...s.yape, qrUrl: urlServidor(s.yape.qrUrl) } : null,
        }),
      error: () => {
        // Sin conexión el sitio sigue funcionando con el logo de texto y sin iniciativas.
      },
    });
  }

  // ---- Administrador ----

  /** Sube una imagen; `url` viene completa y `ruta` es la relativa ("/api/imagen/1") que se guarda. */
  subirImagen(archivo: File): Observable<ImagenSubida & { ruta: string }> {
    const datos = new FormData();
    datos.append('archivo', archivo);
    return this.http
      .post<ImagenSubida>(`${API_URL}/imagen`, datos)
      .pipe(map((i) => ({ ...i, ruta: i.url, url: urlServidor(i.url)! })));
  }

  guardarLogo(imagenId: number | null): Observable<void> {
    return this.http.put<void>(`${API_URL}/sitio/logo`, { imagenId });
  }

  /** Número, titular y QR de Yape; todo en null quita la sección de la página Donar. */
  guardarYape(datos: YapeGuardar): Observable<void> {
    return this.http.put<void>(`${API_URL}/sitio/yape`, datos);
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

  /** Aprueba (aparece en el sitio) o rechaza una iniciativa propuesta por un miembro. */
  revisarIniciativa(id: number, estado: 'Aprobada' | 'Rechazada', motivo = ''): Observable<Iniciativa> {
    return this.http.put<Iniciativa>(`${API_URL}/iniciativa/${id}/revision`, { estado, motivo });
  }

  // ---- Voluntarios y practicantes ----

  misIniciativas(): Observable<Iniciativa[]> {
    return this.http.get<Iniciativa[]>(`${API_URL}/iniciativa/mias`);
  }

  proponerIniciativa(datos: IniciativaPropuesta): Observable<Iniciativa> {
    return this.http.post<Iniciativa>(`${API_URL}/iniciativa/propuesta`, datos);
  }
}
