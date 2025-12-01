import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AdminNavbar } from '../admin/admin-navbar/admin-navbar';
import { PerfilUsuarioAdmin } from '../perfil-usuario-admin/perfil-usuario-admin';

interface TarjetaUsuario {
  numero: string;
  tipo: string;
  estado: 'Activa' | 'Suspendida';
  saldo: number;
}

interface Usuario {
  id: string;
  nombre: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  beneficio: string;
  email: string;
  telefono: string;
  username: string;
  fotoUrl: string;
  tarjetas: TarjetaUsuario[];
  idPersonal?: number;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbar, PerfilUsuarioAdmin],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Usuarios implements OnInit {

  searchTerm = '';
  usuarios: Usuario[] = [];

  private apiUrlUsuarios = 'http://localhost:5001/users';
  private apiUrlDetalleUsuario = 'http://localhost:5001/users';
  private apiUrlTarjetas = 'http://localhost:5001/users/tarjetas';

  mostrarPerfil = false;
  usuarioSeleccionado: Usuario | null = null;

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.http.get<any[]>(this.apiUrlUsuarios).subscribe({
      next: (data) => {
        this.usuarios = data.map((u) => ({
          id: u.IDUSUARIOS?.toString() || '',
          nombre: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          beneficio: 'Sin beneficio',
          email: '',
          telefono: '',
          username: u.NOMBREUSUARIO || '',
          fotoUrl: 'assets/img/user-placeholder.png',
          tarjetas: []
        }));

        this.cdr.markForCheck();
        console.log('Usuarios cargados:', this.usuarios);
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  cargarDetalleUsuario(usuarioId: string) {
    const url = `${this.apiUrlDetalleUsuario}/${usuarioId}`;
    this.http.get<any>(url).subscribe({
      next: (detalle) => {
        if (this.usuarioSeleccionado) {
          this.usuarioSeleccionado.nombre = detalle.NOMBRE || '';
          this.usuarioSeleccionado.apellidoPaterno = detalle.APELLIDOPATERNO || '';
          this.usuarioSeleccionado.apellidoMaterno = detalle.APELLIDOMATERNO || '';
          this.usuarioSeleccionado.email = detalle.CORREO || '';
          this.usuarioSeleccionado.username = detalle.NOMBREUSUARIO || '';
          this.usuarioSeleccionado.idPersonal = detalle.IDPERSONAL;

          

          this.cdr.markForCheck();
          console.log('Detalle del usuario cargado:', detalle);
        }
      },
      error: (err) => console.error('Error al cargar detalle del usuario:', err)
    });
  }

  

  get usuariosFiltrados(): Usuario[] {
    const term = this.searchTerm.toLowerCase();
    return this.usuarios.filter(u => {
      const full = `${u.nombre} ${u.apellidoPaterno} ${u.apellidoMaterno}`.toLowerCase();
      return u.id.toLowerCase().includes(term) 
          || full.includes(term) 
          || (u.username || '').toLowerCase().includes(term);
    });
  }

  verPerfil(usuario: Usuario) {
    this.usuarioSeleccionado = { ...usuario };
    this.cargarDetalleUsuario(usuario.username);
    this.mostrarPerfil = true;
  }

  cerrarPerfil() {
    this.mostrarPerfil = false;
    this.usuarioSeleccionado = null;
  }

  guardarPerfil(payload: any) {
    const url = `http://localhost:5001/users/update/${payload.id}`;

    this.http.put(url, payload).subscribe({
      next: (resp) => {
        console.log("Usuario actualizado en backend:", resp);

        this.cargarUsuarios();

        this.cerrarPerfil();
      },
      error: (err) => {
        console.error("Error al actualizar usuario:", err);
        alert(err.error.error || "Error al actualizar usuario");
      }
    });
  }

  
eliminar(id: string) {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

  const url = `${this.apiUrlUsuarios}/${id}`;
  this.http.delete(url).subscribe({
    next: (resp: any) => {
      console.log('Usuario eliminado:', resp);
      
      // Eliminar localmente de la lista
      this.usuarios = this.usuarios.filter(u => u.id !== id);
      
      alert(resp.message || 'Usuario eliminado correctamente');
      this.cdr.markForCheck();
    },
    error: (err) => {
      console.error('Error al eliminar usuario:', err);
      alert(err.error?.error || 'No se pudo eliminar el usuario');
    }
  });
}

}
