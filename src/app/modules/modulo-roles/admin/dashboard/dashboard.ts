import { Component } from '@angular/core';

/** Dashboard de ejemplo (mockup): todos los datos son de muestra. */
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly indicadores = [
    { titulo: 'Pacientes activos', valor: '128' },
    { titulo: 'Citas de hoy', valor: '14' },
    { titulo: 'Sesiones del mes', valor: '96' },
    { titulo: 'Psicólogos activos', valor: '8' },
  ];

  protected readonly citasPorDia = [
    { dia: 'Lun', cantidad: 12 },
    { dia: 'Mar', cantidad: 16 },
    { dia: 'Mié', cantidad: 9 },
    { dia: 'Jue', cantidad: 18 },
    { dia: 'Vie', cantidad: 14 },
    { dia: 'Sáb', cantidad: 6 },
  ];

  protected readonly maximoCitas = Math.max(...this.citasPorDia.map((d) => d.cantidad));

  protected readonly proximasCitas = [
    { hora: '09:00', paciente: 'Juan Pérez', psicologo: 'Dra. Rojas' },
    { hora: '10:30', paciente: 'María Torres', psicologo: 'Dr. Castillo' },
    { hora: '12:00', paciente: 'Ana Flores', psicologo: 'Dr. Castillo' },
    { hora: '15:30', paciente: 'Luis Ramos', psicologo: 'Dra. Rojas' },
  ];
}
