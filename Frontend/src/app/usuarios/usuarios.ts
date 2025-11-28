import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AdminNavbar } from '../admin/admin-navbar/admin-navbar';
import { PerfilUsuarioAdmin } from '../perfil-usuario-admin/perfil-usuario-admin';

//interfases de las tajetas
interface TarjetaUsuario {
  numero: string;
  tipo: string;
  estado: 'Activa' | 'Suspendida';
  saldo: number;
}
//informacion de los usuarios
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
  private apiUrlUsuarios = 'http://localhost:5000/users';
  private apiUrlDetalleUsuario = 'http://localhost:5000/users';
  private apiUrlTarjetas = 'http://127.0.0.1:5000/users/tarjetas';

  // estado del modal de perfil
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
          // API list only provides username; leave name parts empty until detail is fetched
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
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  cargarDetalleUsuario(usuarioId: string) {
    const url = `${this.apiUrlDetalleUsuario}/${usuarioId}`;
    this.http.get<any>(url).subscribe({
      next: (detalle) => {
        if (this.usuarioSeleccionado) {
          // separar nombre y apellidos
          this.usuarioSeleccionado.nombre = detalle.NOMBRE || '';
          this.usuarioSeleccionado.apellidoPaterno = detalle.APELLIDOPATERNO || '';
          this.usuarioSeleccionado.apellidoMaterno = detalle.APELLIDOMATERNO || '';
          this.usuarioSeleccionado.email = detalle.CORREO || '';
          this.usuarioSeleccionado.username = detalle.NOMBREUSUARIO || '';
          // guardar idPersonal si viene en el detalle
          this.usuarioSeleccionado.idPersonal = detalle.IDPERSONAL ?? detalle.idPersonal ?? undefined;
          // cargar las tarjetas asociadas si disponemos de IDPERSONAL
          const idPersonal = this.usuarioSeleccionado.idPersonal;
          if (idPersonal) {
            this.cargarTarjetas(idPersonal);
          }
          this.cdr.markForCheck();
          console.log('Detalle del usuario cargado:', detalle);
        }
      },
      error: (err) => {
        console.error('Error al cargar detalle del usuario:', err);
      }
    });
  }

  cargarTarjetas(idPersonal: number) {
    const url = `${this.apiUrlTarjetas}/${idPersonal}`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        const tarjetas = (data || []).map((t: any) => ({
          numero: t.NUMTARJETA || t.NUMTARJETA || '',
          tipo: t.TIPO || t.TIP0 || 'Desconocido',
          estado: (t.STATUS === 'ACTIVA' || t.STATUS === 'Activa') ? 'Activa' : 'Suspendida',
          saldo: Number.parseFloat(t.SALDO || '0') || 0
        } as TarjetaUsuario));

        if (this.usuarioSeleccionado) {
          this.usuarioSeleccionado.tarjetas = tarjetas;
          this.cdr.markForCheck();
          console.log('Tarjetas cargadas para idPersonal', idPersonal, tarjetas);
        }
      },
      error: (err) => {
        console.error('Error al cargar tarjetas del usuario:', err);
      }
    });
  }

  get usuariosFiltrados(): Usuario[] {
    const term = this.searchTerm.toLowerCase();
    return this.usuarios.filter(u => {
      const full = `${u.nombre || ''} ${u.apellidoPaterno || ''} ${u.apellidoMaterno || ''}`.toLowerCase();
      return u.id.toLowerCase().includes(term) || full.includes(term) || (u.username || '').toLowerCase().includes(term);
    });
  }

  verPerfil(usuario: Usuario) {
    // clonar para no modificar directo el arreglo hasta guardar
    this.usuarioSeleccionado = {
      ...usuario,
      tarjetas: usuario.tarjetas.map(t => ({ ...t }))
    };
    // usar username para obtener el detalle completo (ya que /users/{id} da 404)
    this.cargarDetalleUsuario(usuario.username || usuario.id);
    this.mostrarPerfil = true;
  }

  cerrarPerfil() {
    this.mostrarPerfil = false;
    this.usuarioSeleccionado = null;
  }

  guardarPerfil(usuarioActualizado: Usuario) {
    this.usuarios = this.usuarios.map(u =>
      u.id === usuarioActualizado.id ? usuarioActualizado : u
    );
    console.log('Usuario actualizado:', usuarioActualizado);
    this.cerrarPerfil();
  }

  eliminar(id: string) {
    this.usuarios = this.usuarios.filter(u => u.id !== id);
  }
}
