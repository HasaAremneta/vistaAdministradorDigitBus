import { Component, EventEmitter, output, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-form-modal',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-form-modal.html',
  styleUrl: './admin-form-modal.css',
})
export class AdminFormModal {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<{nombre: string; username: string; password: string}>();

  nombre = '';
  username = '';
  password = '';

   onCerrar(){
    this.cerrar.emit()
   }

   onGuardar(){
    if(!this.username.trim() || !this.password.trim()){
      alert('El nombre de usuario y la contraseña son obligatorios.')
      return;
    }

    this.guardar.emit({
      nombre: this.nombre.trim() || this.username.trim(),
      username: this.username.trim(),
      password: this.password.trim()
    });

    this.nombre = '';
    this.username = '';
    this.password = '';

   }
}
