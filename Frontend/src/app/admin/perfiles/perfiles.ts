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

  tarjetas: TarjetaAdmin[] = [];
  searchTerm: string = '';   // 👈 SE AGREGA

  // paginación
  pageSize = 7;
  currentPage = 1;

  private apiUrlTarjetasAll = 'http://127.0.0.1:5001/users/tarjetas';

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
          tipo: t.TIPO || 'Desconocido',
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

        this.currentPage = 1;
        this.cdr.markForCheck();
        console.log('Tarjetas cargadas:', this.tarjetas);
      },
      error: (err) => {
        console.error('Error al cargar tarjetas:', err);
      }
    });
  }

  // 👇 NUEVO FILTRO
  private get tarjetasFiltradasAll(): TarjetaAdmin[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.tarjetas;

    return this.tarjetas.filter(t =>
      t.idTarjeta.toLowerCase().includes(term) ||
      t.numTarjeta.toLowerCase().includes(term)
    );
  }
  
  get totalPages(): number {
    const total = this.tarjetasFiltradasAll.length;
    return total ? Math.ceil(total / this.pageSize) : 1;
  }

  get tarjetasFiltradas(): TarjetaAdmin[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.tarjetasFiltradasAll.slice(start, end);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  mostrarModal = false;
  tarjetaSeleccionada: TarjetaAdmin | null = null;

  verTarjeta(t: TarjetaAdmin) {
    this.tarjetaSeleccionada = t;
    this.mostrarModal = true;
  }

  desactivarTarjeta(idTarjeta: string) {
    const url = `http://127.0.0.1:5001/users/tarjeta/${idTarjeta}/deactivate`;
    this.http.put(url, {}).subscribe({
      next: () => {
        console.log('Tarjeta desactivada:', idTarjeta);

        if (this.tarjetaSeleccionada) {
          this.tarjetaSeleccionada.status = 'inactiva';
        }

        const tarjeta = this.tarjetas.find(t => t.idTarjeta === idTarjeta);
        if (tarjeta) {
          tarjeta.status = 'inactiva';
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al desactivar tarjeta:', err);
      }
    });
  }

  reactivarTarjeta(idTarjeta: string) {
    const url = `http://127.0.0.1:5001/users/tarjeta/${idTarjeta}/activate`;
    this.http.put(url, {}).subscribe({
      next: () => {
        console.log('Tarjeta reactivada:', idTarjeta);

        if (this.tarjetaSeleccionada) {
          this.tarjetaSeleccionada.status = 'activa';
        }

        const tarjeta = this.tarjetas.find(t => t.idTarjeta === idTarjeta);
        if (tarjeta) {
          tarjeta.status = 'activa';
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al reactivar tarjeta:', err);
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.tarjetaSeleccionada = null;
  }
}
