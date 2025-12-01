import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Solicitudes } from '../solicitudes/solicitudes';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';// Para manejar URLs seguras

interface Documento {
  tipo: string;
  nombreArchivo: string;
  url: SafeUrl;// URL segura para mostrar el documento
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

  @Input() reporte: any;
  @Output() cerrar = new EventEmitter<void>();
  @Output() rechazar = new EventEmitter<string>();
  @Output() aceptar = new EventEmitter<void>();

  documentos: Documento[] = [];

  mostrarObsModal = false;
  docSeleccionado: Documento | null = null;
  observacionesTemp: string = '';

  mostrarRechazoModal = false;
  motivoRechazo = '';
  private apiUrl = 'http://localhost:5001/solicitudes';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}


  ngOnChanges(changes: SimpleChanges) {
    if (changes['reporte'] && this.reporte) {
      this.loadDocumentosFromReporte();
    }
  }
  // Construye una URL segura a partir de datos base64
  private buildDataUrl(base64: string): SafeUrl {
    if (!base64) {
      return this.sanitizer.bypassSecurityTrustUrl('');
    }

    // Detectar tipo de archivo de forma simple
    let mime = 'image/png';              // por defecto
    const prefix = base64.substring(0, 10);

    if (prefix.startsWith('JVBERi0')) {
      mime = 'application/pdf';         // PDF
    } else if (prefix.startsWith('/9j/')) {
      mime = 'image/jpeg';              // JPG
    }

    const url = `data:${mime};base64,${base64}`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  // Verifica si el documento es un PDF
  isPdf(doc: Documento): boolean {
    return (doc.nombreArchivo || '').toLowerCase().endsWith('.pdf');
  }
  // Verifica si el documento es una imagen
  isImage(doc: Documento): boolean {
    const name = (doc.nombreArchivo || '').toLowerCase();
    return name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg');
  }

  private loadDocumentosFromReporte() {
  // Para depurar qué viene realmente
    console.log('Reporte en Datosolicitud:', this.reporte);
    console.log('Keys:', Object.keys(this.reporte || {}));

    this.documentos = [];

    // 1) Si algún día vienen como arreglo, se respeta
    const rawDocs = this.reporte?.documentos
                || this.reporte?.DOCUMENTOS
                || this.reporte?.docs
                || this.reporte?.archivos
                || [];

    if (Array.isArray(rawDocs) && rawDocs.length) {
      this.documentos = rawDocs.map((d: any) => ({
        tipo: d.tipo || d.TIPO || d.name || 'Documento',
        nombreArchivo: d.nombreArchivo || d.NOMBRE || d.fileName || d.nombre || 'archivo',
        url: this.buildDataUrl(d.base64Data || d.DATA || ''),   // por si un día mandas base64 directo
        requiereCambio: d.requiereCambio || d.requiresChange || false,
        observaciones: d.observaciones || d.OBSERVACIONES || ''
      }));
      return;
    }

    // 2) Campos que ya tienes en la tabla DOCUMENTACION
    const tarjetas   = this.reporte.TARJETAS;
    const constancia = this.reporte.CONSTANCIA;
    const vauches    = this.reporte.VAUCHES;

    const docs: Documento[] = [];

    if (tarjetas) {
      docs.push({
        tipo: 'Foto / Tarjeta',
        nombreArchivo: 'tarjeta.png',
        url: this.buildDataUrl(tarjetas)
      });
    }

    if (constancia) {
      docs.push({
        tipo: 'Constancia / Comprobante',
        nombreArchivo: 'constancia.png',
        url: this.buildDataUrl(constancia)
      });
    }

    if (vauches) {
      docs.push({
        tipo: 'Identificación / Voucher',
        nombreArchivo: 'identificacion_o_voucher.png',
        url: this.buildDataUrl(vauches)
      });
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
