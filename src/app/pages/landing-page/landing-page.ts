import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, ButtonModule, CardModule, DividerModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage {
  features = [
    { icon: 'pi pi-chart-pie', title: 'Análisis en Tiempo Real', desc: 'Visualiza el estado financiero y operativo de tu empresa al instante.' },
    { icon: 'pi pi-users', title: 'Recursos Humanos', desc: 'Gestiona nóminas, asistencias y el talento humano de forma integral.' },
    { icon: 'pi pi-box', title: 'Control de Inventarios', desc: 'Alertas automáticas y seguimiento de stock en múltiples almacenes.' },
    { icon: 'pi pi-lock', title: 'Seguridad Empresarial', desc: 'Infraestructura blindada siguiendo estándares OWASP y buenas prácticas.' },
    { icon: 'pi pi-cloud', title: 'Respaldo en la Nube', desc: 'Tus datos siempre disponibles y respaldados con redundancia.' },
    { icon: 'pi pi-bolt', title: 'Alta Disponibilidad', desc: 'Sistema optimizado para garantizar un 99.9% de tiempo en línea.' }
  ];

  stats = [
    { value: '+500', label: 'Empresas activas' },
    { value: '1M+', label: 'Transacciones diarias' },
    { value: '99.9%', label: 'Uptime garantizado' },
    { value: '24/7', label: 'Soporte técnico' }
  ];
}