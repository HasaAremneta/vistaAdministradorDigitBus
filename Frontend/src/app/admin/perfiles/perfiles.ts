import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminNavbar } from '../admin-navbar/admin-navbar';

interface TarjetaAdmin {
  idTarjeta: string;
  numTarjeta: string;
  tipo: string;
  status: string;
  saldo: number | string;
  fechaEmision?: string;
  fechaVencimiento?: string;
  idPersonal?: number;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombreUsuario?: string;
  correo?: string;
}

@Component({
  selector: 'app-perfiles',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbar],
  templateUrl: './perfiles.html',
  styleUrls: ['./perfiles.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Perfiles implements OnInit {
  // Datos de prueba - ahora para tarjetas
  tarjetas: TarjetaAdmin[] = [];
  private apiUrlTarjetasAll = 'http://127.0.0.1:5000/users/tarjetas';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarTodasTarjetas();
  }

  cargarTodasTarjetas() {
    this.http.get<any[]>(this.apiUrlTarjetasAll).subscribe({
      next: (data) => {
        this.tarjetas = (data || []).map((t: any) => ({
          idTarjeta: (t.IDTARJETA != null) ? String(t.IDTARJETA) : (t.IDTARJETA || ''),
          numTarjeta: t.NUMTARJETA || t.NUMTARJETA || '',
          tipo: t.TIPO || t.TIP0 || 'Desconocido',
          status: t.STATUS || 'DESCONOCIDO',
          saldo: t.SALDO || '0',
          fechaEmision: t.FECHAEMISION,
          fechaVencimiento: t.FECHAVECIMIENTO,
          idPersonal: t.IDPERSONAL,
          nombre: t.NOMBRE || '',
          apellidoPaterno: t.APELLIDOPATERNO || '',
          apellidoMaterno: t.APELLIDOMATERNO || '',
          nombreUsuario: t.NOMBREUSUARIO || '',
          correo: t.CORREO || ''
        } as TarjetaAdmin));
        this.cdr.markForCheck();
        console.log('Tarjetas cargadas:', this.tarjetas);
      },
      error: (err) => {
        console.error('Error al cargar tarjetas:', err);
      }
    });
  }

  mostrarModal = false;
  tarjetaSeleccionada: TarjetaAdmin | null = null;

  verTarjeta(t: TarjetaAdmin) {
    this.tarjetaSeleccionada = t;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.tarjetaSeleccionada = null;
  }
}
