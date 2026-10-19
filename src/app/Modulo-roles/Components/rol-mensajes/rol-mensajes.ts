import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { Contacto } from '../../../Modulo-compartido/Models/contacto.model';
import { ContactoService } from '../../../Modulo-compartido/Services/contacto.service';

/** Bandeja de mensajes recibidos desde el formulario de contacto del sitio público. */
@Component({
  selector: 'app-mensajes',
  standalone: false,
  templateUrl: './rol-mensajes.html',
  styleUrl: './rol-mensajes.scss',
})
export class Mensajes {
  private readonly contactoService = inject(ContactoService);

  protected readonly mensajes = signal<Contacto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  /** Mensaje al que se está redactando una respuesta por correo. */
  protected readonly respondiendoA = signal<Contacto | null>(null);
  protected readonly enviando = signal(false);
  protected readonly respuesta = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(3000)],
  });

  protected readonly sinLeer = computed(() => this.mensajes().filter((m) => !m.leido).length);

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.contactoService.listar().subscribe({
      next: (mensajes) => {
        this.mensajes.set(mensajes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los mensajes.');
        this.cargando.set(false);
      },
    });
  }

  protected marcarLeido(mensaje: Contacto): void {
    this.contactoService.marcarLeido(mensaje.id).subscribe({
      next: (actualizado) =>
        this.mensajes.update((lista) => lista.map((m) => (m.id === actualizado.id ? actualizado : m))),
      error: () => this.error.set('No se pudo marcar el mensaje como leído.'),
    });
  }

  protected abrirRespuesta(mensaje: Contacto): void {
    this.aviso.set('');
    this.error.set('');
    this.respuesta.reset('');
    this.respondiendoA.set(mensaje);
  }

  protected cancelarRespuesta(): void {
    this.respondiendoA.set(null);
  }

  /** Envía la respuesta por correo a quien escribió; el mensaje queda como leído. */
  protected enviarRespuesta(): void {
    const mensaje = this.respondiendoA();

    if (!mensaje) return;

    if (this.respuesta.invalid) {
      this.respuesta.markAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set('');

    this.contactoService.responder(mensaje.id, this.respuesta.value).subscribe({
      next: (actualizado) => {
        this.mensajes.update((lista) => lista.map((m) => (m.id === actualizado.id ? actualizado : m)));
        this.enviando.set(false);
        this.respondiendoA.set(null);
        this.aviso.set(`Respuesta enviada a ${actualizado.correo}.`);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo enviar la respuesta.');
      },
    });
  }
}
