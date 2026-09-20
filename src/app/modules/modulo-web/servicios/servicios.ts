import { Component, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-servicios',
  standalone: false,
  templateUrl: './servicios.html',
  styleUrl: './servicios.scss',
})
export class Servicios {
  protected readonly auth = inject(AuthService);

  protected readonly servicios = [
    {
      icono: '🧍',
      titulo: 'Terapia individual',
      descripcion: 'Sesiones personalizadas para trabajar ansiedad, estrés, duelo, autoestima y otros motivos de consulta.',
      modalidad: 'Presencial y virtual',
    },
    {
      icono: '💞',
      titulo: 'Terapia de pareja',
      descripcion: 'Un espacio para mejorar la comunicación, resolver conflictos y reconstruir la confianza.',
      modalidad: 'Presencial y virtual',
    },
    {
      icono: '👨‍👩‍👧',
      titulo: 'Terapia familiar',
      descripcion: 'Acompañamiento a la familia para fortalecer los vínculos y manejar cambios y crisis.',
      modalidad: 'Presencial',
    },
    {
      icono: '🧒',
      titulo: 'Niños y adolescentes',
      descripcion: 'Evaluación y apoyo en conducta, emociones y aprendizaje, con orientación a los padres.',
      modalidad: 'Presencial',
    },
    {
      icono: '🧭',
      titulo: 'Orientación vocacional',
      descripcion: 'Herramientas para descubrir intereses y habilidades y tomar decisiones sobre tu futuro.',
      modalidad: 'Presencial y virtual',
    },
    {
      icono: '🏢',
      titulo: 'Bienestar en organizaciones',
      descripcion: 'Talleres y charlas de salud mental y manejo del estrés para equipos de trabajo.',
      modalidad: 'A coordinar',
    },
  ];
}
