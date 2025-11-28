import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Documento {
  tipo: string;
  nombreArchivo: string;
  url: string;
  requiereCambio?: boolean;
  observaciones?: string;
}

@Component({
  selector: 'app-datosolicitud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './datosolicitud.html',
  styleUrls: ['./datosolicitud.css'],
})
export class Datosolicitud {

  @Input() reporte: any;   // 🔑 Recibe la solicitud desde el padre
  @Output() cerrar = new EventEmitter<void>();
  @Output() rechazar = new EventEmitter<string>();
  @Output() aceptar = new EventEmitter<void>();

  documentos: Documento[] = [];

  mostrarObsModal = false;
  docSeleccionado: Documento | null = null;
  observacionesTemp: string = '';

  mostrarRechazoModal = false;
  motivoRechazo = '';

  abrirObservaciones(doc: Documento) {
    this.docSeleccionado = doc;
    this.observacionesTemp = doc.observaciones ?? '';
    this.mostrarObsModal = true;
  }

  cerrarObservaciones() {
    this.mostrarObsModal = false;
    this.docSeleccionado = null;
    this.observacionesTemp = '';
  }

  confirmarObservaciones() {
    if (this.docSeleccionado) {
      this.docSeleccionado.requiereCambio = true;
      this.docSeleccionado.observaciones = this.observacionesTemp;
    }
    this.cerrarObservaciones();
  }

  abrirRechazo() {
    this.mostrarRechazoModal = true;
  }

  cerrarRechazo() {
    this.mostrarRechazoModal = false;
    this.motivoRechazo = '';
  }

  confirmarRechazo() {
    this.rechazar.emit(this.motivoRechazo);
    this.cerrar.emit();
    this.cerrarRechazo();
  }

  aceptarSolicitud() {
    this.aceptar.emit();
    this.cerrar.emit();
  }

  regresar() {
    this.cerrar.emit();
  }
}
