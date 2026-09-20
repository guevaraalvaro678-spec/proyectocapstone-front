import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { UsuarioService } from '../../../core/services/usuario.service';

/** Pide el correo y envía el enlace para restablecer la contraseña. */
@Component({
  selector: 'app-olvide-password',
  standalone: false,
  templateUrl: './olvide-password.html',
  styleUrl: './olvide-password.scss',
})
export class OlvidePassword {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);

  protected readonly cargando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
  });

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.usuarioService.solicitarRecuperacion(this.form.getRawValue().correo).subscribe({
      // La respuesta es la misma exista o no la cuenta, así que el mensaje tampoco lo revela.
      next: () => {
        this.cargando.set(false);
        this.enviado.set(true);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudo enviar la solicitud. Inténtalo de nuevo.');
      },
    });
  }
}
