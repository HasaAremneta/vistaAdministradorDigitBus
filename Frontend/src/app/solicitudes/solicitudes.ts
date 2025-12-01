import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Solicitudes implements OnInit {

  reportes: ReporteIncidente[] = [];
  mostrarDetalle = false;
  reporteSeleccionado: ReporteIncidente | null = null;
  pageSize = 7;
  currentPage = 1;

  private apiUrl = 'http://localhost:5001/solicitudes';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarSolicitudes();
  }
  cargarSolicitudes() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.reportes = data.map((r) => ({

          ...r,

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
        this.cdr.markForCheck();
        this.currentPage = 1;
        console.log('Solicitudes cargadas:', this.reportes);
      },
      error: (err) => {
        console.error('Error al cargar solicitudes:', err);
      }
    });
  } 
  

  abrirDetalle(reporte: ReporteIncidente) {
    var name = reporte.nombreUsuario;
    this.reporteSeleccionado = reporte;
    this.mostrarDetalle = true;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.reportes.length / this.pageSize));
  }

  get pagedReportes(): ReporteIncidente[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reportes.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    this.cdr.markForCheck();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.markForCheck();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.markForCheck();
    }
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.reporteSeleccionado = null;
  }

  eliminar(reporte: ReporteIncidente) {
    if (!reporte || !reporte.id) {
      console.warn('ID de solicitud inválido, no se eliminará nada.');
      return;
    }

    const url = `${this.apiUrl}/${reporte.id}`;
    this.http.delete(url).subscribe({
      next: () => {
        this.reportes = this.reportes.filter(r => r.id !== reporte.id);
        
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
        this.cdr.markForCheck();
        console.log('Solicitud eliminada:', reporte.id);
      },
      error: (err) => {
        console.error('Error al eliminar solicitud:', err);
      }
    });
  }

  onAceptarSolicitud() {
    console.log('Solicitud aceptada, recargando tabla...');
    this.cargarSolicitudes();
    this.cdr.markForCheck();
  }

  onRechazarSolicitud() {
    console.log('Solicitud rechazada, recargando tabla...');
    this.cargarSolicitudes();
    this.cdr.markForCheck();
  }
}
