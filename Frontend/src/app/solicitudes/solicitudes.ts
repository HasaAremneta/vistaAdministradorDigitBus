import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminNavbar } from '../admin/admin-navbar/admin-navbar';
import { Datosolicitud } from '../datosolicitud/datosolicitud';

interface ReporteIncidente {
  id: string;
  usuario: string;
  tipo: 'Robo' | 'Pérdida';
  status: 'Revisión' | 'Concluida';
}

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule,FormsModule,AdminNavbar, Datosolicitud],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css',
})
export class Solicitudes {

  reportes:ReporteIncidente[] = [
    { id: '00045', usuario: 'Hassael Mario',    tipo: 'Robo',    status: 'Revisión' },
    { id: '00223', usuario: 'Hugo Santiago',    tipo: 'Robo',    status: 'Concluida' },
    { id: '00255', usuario: 'Guillermo Chavez', tipo: 'Pérdida', status: 'Revisión' },
  ];

  mostrarDetalle = false;

  reporteSeleccionado: ReporteIncidente | null = null;

  abrirDetalle(reporte: ReporteIncidente){
    this.reporteSeleccionado = reporte;
    this.mostrarDetalle = true;
  }
    cerrarDetalle() {
    this.mostrarDetalle = false;
    this.reporteSeleccionado = null;
  }

  eliminar(reporte: ReporteIncidente) {
    this.reportes = this.reportes.filter(r => r.id !== reporte.id);
    console.log('Eliminado', reporte);
  }
}
