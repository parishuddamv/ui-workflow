import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SafeUrlPipe } from "./safe-url.pipe";

@Component({
  selector: 'app-preview-modal',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './preview-modal.component.html',
  styleUrls: ['./preview-modal.component.scss']
})
export class PreviewModalComponent {
  @Input() previewUrl: string | null = null;
  @Input() previewType: 'pdf' | 'image' | 'other' = 'other';
  @Output() close = new EventEmitter<void>();

  isPdf(): boolean {
    return this.previewType === 'pdf';
  }

  isImage(): boolean {
    return this.previewType === 'image';
  }

  closePreview(): void {
    this.close.emit();
  }
}
