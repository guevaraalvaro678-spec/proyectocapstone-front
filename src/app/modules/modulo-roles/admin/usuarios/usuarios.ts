import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';

import { TipoUsuario, UsuarioDetalle, UsuarioLista } from '../../../../core/models/usuario-admin.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { fechaHora, fechaLarga, hora } from '../../../../core/utils/fechas';

type FiltroEstado = 'todos' | 'activos' | 'desactivados';

/** Tabla de usuarios del sistema con su detalle: perfil, solicitudes y citas. */
@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {
  private readonly usuarioService = inject(UsuarioService);
  protected readonly auth = inject(AuthService);

  protected readonly tipo = signal<TipoUsuario>('Usuario');
  protected readonly estado = signal<FiltroEstado>('todos');
  protected readonly buscar = new FormControl('', { nonNullable: true });

  protected readonly usuarios = signal<UsuarioLista[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  protected readonly detalle = signal<UsuarioDetalle | null>(null);
  protected readonly cargandoDetalle = signal(false);
  protected readonly trabajandoEn = signal<number | null>(null);

  protected readonly total = computed(() => this.usuarios().length);

  protected readonly fechaHora = fechaHora;
  protected readonly fecha = fechaLarga;
  protected readonly hora = hora;

  constructor() {
    this.cargar();

    // La búsqueda espera un momento a que termines de escribir antes de consultar.
    this.buscar.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.cargar());
  }

  protected cambiarTipo(valor: string): void {
    this.tipo.set(valor as TipoUsuario);
    this.detalle.set(null);
    this.cargar();
  }

  protected cambiarEstado(valor: string): void {
    this.estado.set(valor as FiltroEstado);
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    const activo = this.estado() === 'todos' ? null : this.estado() === 'activos';

    this.usuarioService.listar(this.tipo(), this.buscar.value, activo).subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.mensaje ?? 'No se pudieron cargar los usuarios.');
        this.cargando.set(false);
      },
    });
  }

  protected verDetalle(usuario: UsuarioLista): void {
    this.cargandoDetalle.set(true);
    this.detalle.set(null);
    this.error.set('');

    this.usuarioService.obtenerDetalle(usuario.id).subscribe({
      next: (detalle) => {
        this.detalle.set(detalle);
        this.cargandoDetalle.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.mensaje ?? 'No se pudo cargar el detalle.');
        this.cargandoDetalle.set(false);
      },
    });
  }

  protected cerrarDetalle(): void {
    this.detalle.set(null);
  }

  protected alternarActivo(usuario: UsuarioLista): void {
    const desactivar = usuario.activo;
    const pregunta = desactivar
      ? `¿Desactivar la cuenta de ${usuario.nombre}? No podrá iniciar sesión hasta que la reactives.`
      : `¿Reactivar la cuenta de ${usuario.nombre}?`;

    if (!confirm(pregunta)) return;

    this.trabajandoEn.set(usuario.id);
    this.error.set('');
    this.aviso.set('');

    this.usuarioService.cambiarActivo(usuario.id, !usuario.activo).subscribe({
      next: (actualizado) => {
        this.usuarios.update((lista) => lista.map((u) => (u.id === actualizado.id ? actualizado : u)));
        this.detalle.update((d) => (d && d.id === actualizado.id ? { ...d, activo: actualizado.activo } : d));
        this.trabajandoEn.set(null);
        this.aviso.set(actualizado.activo ? 'Cuenta reactivada.' : 'Cuenta desactivada: su sesión se cerró.');
      },
      error: (err: HttpErrorResponse) => {
        this.trabajandoEn.set(null);
        this.error.set(err.error?.mensaje ?? 'No se pudo cambiar el estado de la cuenta.');
      },
    });
  }
}
