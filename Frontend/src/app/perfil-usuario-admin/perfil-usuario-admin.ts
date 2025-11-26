import { Component,EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//interfas de los datos de los usuario y tarjetas
interface TarjetaUsuario {
  numero: string;
  tipo: string;
  estado: 'Activa' | 'Suspendida';
  saldo: number;
}

interface Usuario {
  id: string;
  nombre: string;
  beneficio: string;
  email: string;
  telefono: string;
  username: string;
  tarjetas: TarjetaUsuario[];
}

@Component({
  selector: 'app-perfil-usuario-admin',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-usuario-admin.html',
  styleUrl: './perfil-usuario-admin.css',
})
export class PerfilUsuarioAdmin {
  @Input() usuario!: Usuario;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<Usuario>();

  onCerrar() {
    this.cerrar.emit();
  }

  onGuardar() {
    this.guardar.emit(this.usuario);
  }
}
