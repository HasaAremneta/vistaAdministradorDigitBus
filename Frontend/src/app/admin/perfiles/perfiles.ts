import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavbar } from '../admin-navbar/admin-navbar';

interface UsuarioPerfil {
  id: string;
  nombre: string;
  beneficio: string; // Estudiante, Tercera edad, Sin beneficio
}

@Component({
  selector: 'app-perfiles',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbar],
  templateUrl: './perfiles.html',
  styleUrls: ['./perfiles.css'],
})
export class Perfiles {
  // Datos de prueba
  usuarios: UsuarioPerfil[] = [
    { id: '001520', nombre: 'Hassael Sánchez', beneficio: 'Estudiante' },
    { id: '001521', nombre: 'Hugo Chávez', beneficio: 'Tercera edad' },
    { id: '001522', nombre: 'Carlos Camarena', beneficio: 'Sin beneficio' },
  ];

  mostrarModal = false;
  usuarioSeleccionado: UsuarioPerfil | null = null;

  verUsuario(u: UsuarioPerfil) {
    this.usuarioSeleccionado = u;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
  }
}
