import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Usuario {
  id: string;
  nombre: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  beneficio: string;
  email: string;
  telefono: string;
  username: string;
}

@Component({
  selector: 'app-perfil-usuario-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-usuario-admin.html',
  styleUrl: './perfil-usuario-admin.css',
})
export class PerfilUsuarioAdmin {
  @Input() usuario!: Usuario;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();
 constructor(private cdr: ChangeDetectorRef) {}
  nuevaPassword: string = "";
  ngOnChanges() {
    this.cdr.detectChanges();
  } 
  onCerrar() {
    this.cerrar.emit();
  }

  onGuardar() {
    const payload = {
      id: this.usuario.id,
      nombre: this.usuario.nombre,
      apellido_paterno: this.usuario.apellidoPaterno,
      apellido_materno: this.usuario.apellidoMaterno,
      nombre_usuario: this.usuario.username,
      correo: this.usuario.email,
      password: this.nuevaPassword || null
    };

    this.guardar.emit(payload);
    this.cdr.detectChanges();
  }
}
