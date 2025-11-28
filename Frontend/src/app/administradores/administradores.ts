import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavbar } from '../admin/admin-navbar/admin-navbar';
import { AdminFormModal } from '../admin-form-modal/admin-form-modal';

//se puede crear otro inyterfas depende de lo que requieras
interface Administrador {
  id: string;
  nombre: string;
  username: string;
  creadoEl: string;
}

@Component({
  selector: 'app-administradores',
  standalone:true,
  imports: [CommonModule,FormsModule,AdminNavbar,AdminFormModal],
  templateUrl: './administradores.html',
  styleUrl: './administradores.css',
})
export class Administradores {

  searchTerm = '';

  //ejemplo de tabla
  administradores:Administrador[] = [
    { id: 'ADM001', nombre: 'Admin principal', username: 'admin', creadoEl: '01/01/2025' },
    { id: 'ADM002', nombre: 'Soporte DigitBus', username: 'soporte', creadoEl: '15/02/2025' },
  ];

  mostrarModal = false;

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
    const nuevoId = `ADM${(this.administradores.length + 1).toString().padStart(3, '0')}`;
    const hoy = new Date();
    const creadoEl = hoy.toLocaleDateString('es-MX');

    this.administradores.push({
      id: nuevoId,
      nombre: datos.nombre,
      username: datos.username,
      creadoEl
    });

    console.log('Admin creado (password solo para ejemplo):', datos);
    this.mostrarModal = false;
  }
}
