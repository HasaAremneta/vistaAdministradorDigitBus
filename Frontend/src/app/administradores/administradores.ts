import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AdminNavbar } from '../admin/admin-navbar/admin-navbar';
import { AdminFormModal } from '../admin-form-modal/admin-form-modal';

interface Administrador {
  id: string;
  nombre: string;
  username: string;
  creadoEl: string;
}

@Component({
  selector: 'app-administradores',
  standalone:true,
  imports: [CommonModule,FormsModule,AdminNavbar,AdminFormModal,HttpClientModule],
  templateUrl: './administradores.html',
  styleUrl: './administradores.css',
})
export class Administradores {

  searchTerm = '';

  administradores: Administrador[] = [];

  mostrarModal = false;
  loading = false;
  errorMessage = '';

  get administradoresFiltrados(): Administrador[]{
    const term = this.searchTerm.toLowerCase();
    return this.administradores.filter(a =>
      a.id.toLowerCase().includes(term) ||
      a.nombre.toLowerCase().includes(term) ||
      a.username.toLowerCase().includes(term)
    );
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarAdmin(datos: { nombre: string; username: string; password: string }){
    console.log('Recargando administradores tras creación:', datos);
    this.loadAdministradores().subscribe({
      next: (data) => {
        this.handleLoad(data);
        this.mostrarModal = false;
      },
      error: (err) => this.handleLoadError(err)
    });
  }

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAdministradores().subscribe({
      next: (data) => this.handleLoad(data),
      error: (err) => this.handleLoadError(err)
    });
  }
  loadAdministradores(): Observable<any[]> {
    this.loading = true;
    this.errorMessage = '';
    return this.http.get<any[]>('http://localhost:5000/users/admin');
  }

  private handleLoad(data: any[]) {
    this.administradores = data.map(d => ({
      id: String((d as any).IDUSUARIOS ?? (d as any).id ?? ''),
      nombre: (d as any).NOMBREUSUARIO ?? (d as any).nombre ?? '',
      username: (d as any).USERNAME ?? (d as any).username ?? (d as any).NOMBREUSUARIO ?? '',
      creadoEl: (d as any).CREADOEL ?? (d as any).creadoEl ?? ''
    }));
    this.loading = false;
    this.cdr.detectChanges();
  }

  private handleLoadError(err: any) {
    console.error('Error cargando administradores', err);
    this.errorMessage = 'No se pudieron cargar los administradores.';
    this.loading = false;
    this.cdr.detectChanges();
  }

  eliminarAdmin(id: string): void {
    const confirmDelete = confirm('¿Estás seguro que deseas eliminar este administrador?');
    if (!confirmDelete) return;
    this.loading = true;
    this.errorMessage = '';
    this.http.delete(`http://localhost:5000/users/${id}`).subscribe({
      next: () => {
        console.log(`Administrador ${id} eliminado.`);
        this.loadAdministradores().subscribe({
          next: (data) => {
            this.handleLoad(data);
            alert('Administrador eliminado correctamente.');
          },
          error: (err) => this.handleLoadError(err)
        });
      },
      error: (err) => {
        console.error('Error eliminando administrador', err);
        this.errorMessage = 'No se pudo eliminar el administrador.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
