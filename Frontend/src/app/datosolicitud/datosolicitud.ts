import { CommonModule } from '@angular/common';
import { Component,EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Documento {
  tipo: string;
  nombreArchivo: string;
  url: string;
  requiereCambio?: boolean;
  observaciones?:string;
}

@Component({
  selector: 'app-datosolicitud',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './datosolicitud.html',
  styleUrl: './datosolicitud.css',
})
export class Datosolicitud {

  @Output() cerrar = new EventEmitter<void>(); // cerrar modal principal
  @Output() rechazar = new EventEmitter<string>(); // enviar motivo de rechazo hacia el padre
  @Output() aceptar = new EventEmitter<void>();  // cuando se acepta la solicitud

  //Ejemplo de como debe de verse
  solicitudId = '001522';
  nombreUsuario = 'Guillermo Chavez';

  documentos:Documento[] = [
    {
      tipo: 'Acta de nacimiento',
       nombreArchivo: 'ActaNacimiento_GuillermoCh.pdf',
       url: '#'
    },
    {
      tipo: 'CURP',
      nombreArchivo: 'CURP_GuillermoCh.pdf',
      url: '#'
    },
    {
      tipo: 'Comprobante de pago',
      nombreArchivo: 'CompPago_GuillermoCh.pdf',
      url: '#'
    }
  ];
  //modal de observaciones
  mostrarObsModal = false;
  docSeleccionado: Documento | null = null;
  observacionesTemp: string = '';

  //modal de observaciones
  abrirObservaciones(doc:Documento){
    this.docSeleccionado = doc;
    this.observacionesTemp = doc.observaciones ?? '';
    this.mostrarObsModal = true;
  }

  // Cierra el submodal sin guardar cambios
  cerrarObservaciones() {
    this.mostrarObsModal = false;
    this.docSeleccionado = null;
    this.observacionesTemp = '';
  }

  // Guarda observaciones y marca el doc en rojo
  confirmarObservaciones(){
    if(this.docSeleccionado){
      this.docSeleccionado.requiereCambio = true;
      this.docSeleccionado.observaciones = this.observacionesTemp;
    }
    this.cerrarObservaciones()
  }

  mostrarRechazoModal = false;
  motivoRechazo = '';

  abrirRechazo() {
    this.mostrarRechazoModal = true;
  }

  cerrarRechazo() {
    this.mostrarRechazoModal = false;
    this.motivoRechazo = '';
  }

  confirmarRechazo() {
    this.rechazar.emit(this.motivoRechazo);
    this.cerrar.emit();          // cerrar el modal principal
    this.cerrarRechazo();        // y cerrar submodal
  }


  aceptarSolicitud() {
    this.aceptar.emit();
    this.cerrar.emit();
  }

  regresar() {
    this.cerrar.emit();
  }

}
