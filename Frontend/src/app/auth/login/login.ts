import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.value;

    this.http.post<any>('http://localhost:5000/login', { username, password })
      .pipe(
        catchError(err => {
          this.errorMessage = err.error?.error || 'Error al iniciar sesión';
          return throwError(() => err);
        })
      )
      .subscribe(res => {
        if (res.message === 'Login exitoso') {
          this.errorMessage = null;
          localStorage.setItem('username', username);
          

          // Guardar token JWT en localStorage si viene de Flask
          if (res.token) {
            localStorage.setItem('token', res.token);
          }

          
            this.router.navigate(['home']); // ruta para usuarios normales
          
        } else {
          this.errorMessage = 'Usuario o contraseña incorrectos';
        }
      });
  }
}
