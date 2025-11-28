import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Solicitudes } from '../solicitudes/solicitudes';

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
export class Datosolicitud implements OnChanges {

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
  private apiUrl = 'http://localhost:5000/solicitudes';

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reporte'] && this.reporte) {
      this.loadDocumentosFromReporte();
    }
  }

  private loadDocumentosFromReporte() {
    // Normaliza distintas estructuras posibles del objeto `reporte`.
    const rawDocs = this.reporte.documentos || this.reporte.DOCUMENTOS || this.reporte.docs || this.reporte.archivos || [];

    if (Array.isArray(rawDocs) && rawDocs.length) {
      this.documentos = rawDocs.map((d: any) => ({
        tipo: d.tipo || d.TIPO || d.name || 'Documento',
        nombreArchivo: d.nombreArchivo || d.NOMBRE || d.fileName || d.nombre || 'archivo',
        url: d.url || d.URL || d.link || '#',
        requiereCambio: d.requiereCambio || d.requiresChange || false,
        observaciones: d.observaciones || d.OBSERVACIONES || ''
      }));
      return;
    }

    // Si no vienen documentos como arreglo, intenta crear algunos elementos útiles.
    const docs: any[] = [];
    if (this.reporte.refPago || this.reporte.REFPAGO) {
      docs.push({ tipo: 'Referencia de pago', nombreArchivo: this.reporte.refPago || this.reporte.REFPAGO, url: '#' });
    }
    if (this.reporte.tipoTableta || this.reporte.TIPOTABLETA) {
      docs.push({ tipo: 'Tipo de tableta', nombreArchivo: this.reporte.tipoTableta || this.reporte.TIPOTABLETA, url: '#' });
    }

    this.documentos = docs;
  }

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
    const id = this.reporte?.id || this.reporte?.IDSOLICITUD;
    if (!id) {
      console.warn('No se encontró ID de solicitud para rechazar.');
      this.rechazar.emit();
      this.cerrar.emit();
      return;
    }

    const url = `${this.apiUrl}/${id}/rechazar`;
    const payload = { STATUS: 'Rechazada', status: 'Rechazada' };

    this.http.put(url, payload).subscribe({
      next: () => {
        console.log('Solicitud Rechazada:', id);
        
        this.rechazar.emit(this.motivoRechazo);
        this.cerrar.emit();
         this.cerrarRechazo();
      },
      error: (err) => {
        console.error('Error al rechazar solicitud:', err);
      }
    });
    
    //this.cerrarRechazo();
  }

  aceptarSolicitud() {
    const id = this.reporte?.id || this.reporte?.IDSOLICITUD;
    if (!id) {
      console.warn('No se encontró ID de solicitud para aceptar.');
      this.aceptar.emit();
      this.cerrar.emit();
      return;
    }

    const url = `${this.apiUrl}/${id}/aprobar`;
    const payload = { STATUS: 'Concluida', status: 'Concluida' };

    this.http.put(url, payload).subscribe({
      next: () => {
        console.log('Solicitud aceptada:', id);
        
        this.aceptar.emit();
        this.cerrar.emit();
      },
      error: (err) => {
        console.error('Error al aceptar solicitud:', err);
      }
    });
  }

  regresar() {
    this.cerrar.emit();
  }
}
