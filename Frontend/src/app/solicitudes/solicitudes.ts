import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminNavbar } from '../admin/admin-navbar/admin-navbar';
import { Datosolicitud } from '../datosolicitud/datosolicitud';
import { Router } from '@angular/router';

interface ReporteIncidente {
  id: string;
  nombreUsuario: string;
  nombreCompleto: string;
  correo: string;
  tipo: string;
  status: string;
  fechaSolicitud?: string;
  idPersonal?: number;
  refPago?: string;
  tipoTableta?: string;
}

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbar, Datosolicitud],
  templateUrl: './solicitudes.html',
  styleUrls: ['./solicitudes.css'],
})
export class Solicitudes implements OnInit {

  reportes: ReporteIncidente[] = [];
  mostrarDetalle = false;
  reporteSeleccionado: ReporteIncidente | null = null;

  private apiUrl = 'http://localhost:5000/solicitudes';

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.reportes = data.map((r) => ({
          id: r.IDSOLICITUD?.toString() || '',
          nombreUsuario: r.NOMBREUSUARIO || '',
          nombreCompleto: `${r.NOMBRE || ''} ${r.APELLIDOPATERNO || ''} ${r.APELLIDOMATERNO || ''}`,
          correo: r.CORREO || '',
          tipo: r.TIPOSOLICITUD || '',
          status: r.STATUS || '',
          fechaSolicitud: r.FECHASOLICITUD,
          idPersonal: r.IDPERSONAL,
          refPago: r.REFPAGO,
          tipoTableta: r.TIPOTABLETA
        }));
        console.log('Solicitudes cargadas:', this.reportes);
      },
      error: (err) => {
        console.error('Error al cargar solicitudes:', err);
      }
    });
  }

  abrirDetalle(reporte: ReporteIncidente) {
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
    // Opcional: llamar a un endpoint DELETE en el backend
  }
}
