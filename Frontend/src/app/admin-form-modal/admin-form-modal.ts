import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-form-modal',
  standalone:true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-form-modal.html',
  styleUrl: './admin-form-modal.css',
})
export class AdminFormModal {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<{nombre: string; username: string; password: string}>();

  nombre = '';
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  onCerrar(){
    this.cerrar.emit();
  }

  onGuardar(){
    if(!this.username.trim() || !this.password.trim()){
      alert('El nombre de usuario y la contraseña son obligatorios.');
      return;
    }

    const payload = {
      username: this.username.trim(),
      password: this.password.trim()
    };

    this.loading = true;
    this.errorMessage = '';

    this.http.post<{message: string}>('http://127.0.0.1:5000/users/admin', payload).subscribe({
      next: (res) => {
        if(res && res.message) {
          alert(res.message);
        } else {
          alert('Administrador creado correctamente.');
        }

        this.guardar.emit({
          nombre: this.nombre.trim() || this.username.trim(),
          username: this.username.trim(),
          password: this.password.trim()
        });

        this.nombre = '';
        this.username = '';
        this.password = '';
        this.loading = false;
        this.onCerrar();
      },
      error: (err) => {
        console.error('Error creando administrador', err);
        this.errorMessage = 'No se pudo crear el administrador.';
        alert(this.errorMessage);
        this.loading = false;
      }
    });
  }
}
