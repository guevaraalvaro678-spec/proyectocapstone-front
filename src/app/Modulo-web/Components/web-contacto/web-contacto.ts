import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ContactoService } from '../../../Modulo-compartido/Services/contacto.service';

/** Formulario de contacto del sitio público: guarda el mensaje en la base de datos. */
@Component({
  selector: 'app-contacto',
  standalone: false,
  templateUrl: './web-contacto.html',
  styleUrl: './web-contacto.scss',
})
export class Contacto {
  private readonly fb = inject(FormBuilder);
  private readonly contactoService = inject(ContactoService);

  protected readonly cargando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    mensaje: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
  });

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.enviado.set(false);
    this.error.set('');

    this.contactoService.enviar(this.form.getRawValue()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.enviado.set(true);
        this.form.reset();
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos.');
      },
    });
  }
}
