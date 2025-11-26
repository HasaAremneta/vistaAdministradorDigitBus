import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminNavbar } from '../admin/admin-navbar/admin-navbar';

interface Usuario {
  id: string;
  nombre: string;
  beneficio: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbar],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {

  searchTerm = '';

  usuarios:Usuario[] = [
    { id: '001520', nombre: 'Hassael Sánchez', beneficio: 'Estudiante' },
    { id: '001521', nombre: 'Hugo Chávez', beneficio: 'Tercera edad' },
    { id: '001522', nombre: 'Carlos Camarena', beneficio: 'Sin beneficio' },
    { id: '001523', nombre: 'Guillermo Chavez', beneficio: 'Estudiante' },
  ];

  constructor(private router: Router){}

  get usuariosFiltrados(): Usuario[] {
    const term = this.searchTerm.toLowerCase();
    return this.usuarios.filter(u => u.id.toLowerCase().includes(term) || u.nombre.toLowerCase().includes(term));
  }
  verPerfil(id: string){
    console.log('Ver / modificar usuario', id);

  }
  eliminar(id: string) {
    this.usuarios = this.usuarios.filter(u => u.id !== id);
  }
}
