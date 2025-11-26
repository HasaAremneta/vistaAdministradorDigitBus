import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Home } from './home/home';
import { Solicitudes } from './solicitudes/solicitudes';
import { Usuarios } from './usuarios/usuarios';

export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: Login},
  {path: 'home', component: Home},
  {path: 'solicitudes', component: Solicitudes},
  {path: 'usuarios', component: Usuarios}
];
