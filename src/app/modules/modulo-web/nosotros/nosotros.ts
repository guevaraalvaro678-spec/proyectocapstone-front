import { Component } from '@angular/core';

@Component({
  selector: 'app-nosotros',
  standalone: false,
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.scss',
})
export class Nosotros {
  protected readonly valores = [
    { icono: '🤝', titulo: 'Empatía', texto: 'Escuchamos sin juzgar y nos ponemos en tu lugar.' },
    { icono: '🔒', titulo: 'Confidencialidad', texto: 'Tu información y tus sesiones son privadas.' },
    { icono: '📚', titulo: 'Rigor profesional', texto: 'Trabajamos con métodos respaldados por la evidencia.' },
    { icono: '🌱', titulo: 'Crecimiento', texto: 'Acompañamos procesos de cambio a tu propio ritmo.' },
  ];
}
