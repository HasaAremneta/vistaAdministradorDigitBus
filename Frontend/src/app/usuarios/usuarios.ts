import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  beneficio: string;
  email: string;
  telefono: string;
  username: string;
  fotoUrl: string;
  tarjetas: TarjetaUsuario[];
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbar,PerfilUsuarioAdmin],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {

  searchTerm = '';
  //ejemplo de como se veria
  usuarios: Usuario[] = [
    {
      id: '001520',
      nombre: 'Hassael Sánchez',
      beneficio: 'Estudiante',
      email: 'hassael@example.com',
      telefono: '5512345678',
      username: 'hassael',
      fotoUrl: 'assets/img/user-placeholder.png',
      tarjetas: [
        { numero: '1234 5678 9012 3456', tipo: 'Estudiante', estado: 'Activa', saldo: 150 }
      ]
    },
    {
      id: '001521',
      nombre: 'Hugo Chávez',
      beneficio: 'Tercera edad',
      email: 'hugo@example.com',
      telefono: '5522334455',
      username: 'hugo',
      fotoUrl: 'assets/img/user-placeholder.png',
      tarjetas: [
        { numero: '9999 8888 7777 6666', tipo: 'Tercera edad', estado: 'Activa', saldo: 80 }
      ]
    },
    {
      id: '001522',
      nombre: 'Carlos Camarena',
      beneficio: 'Sin beneficio',
      email: 'carlos@example.com',
      telefono: '5544556677',
      username: 'carlos',
      fotoUrl: 'assets/img/user-placeholder.png',
      tarjetas: [
        { numero: '4444 3333 2222 1111', tipo: 'General', estado: 'Suspendida', saldo: 0 }
      ]
    }
  ];

  // estado del modal de perfil
  mostrarPerfil = false;
  usuarioSeleccionado: Usuario | null = null;

  constructor(private router: Router){}

  get usuariosFiltrados(): Usuario[] {
    const term = this.searchTerm.toLowerCase();
    return this.usuarios.filter(u => u.id.toLowerCase().includes(term) || u.nombre.toLowerCase().includes(term));
  }

  verPerfil(usuario: Usuario) {
    // clonar para no modificar directo el arreglo hasta guardar
    this.usuarioSeleccionado = {
      ...usuario,
      tarjetas: usuario.tarjetas.map(t => ({ ...t }))
    };
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
