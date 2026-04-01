import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-level',
  standalone: true,
  imports: [],
  templateUrl: './level.html',
  styleUrls: ['./level.css'],
})
export class Level implements OnChanges {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() variant: 'minor' | 'major' | 'grand' = 'minor';

  // Pre-computed — updated only when variant input changes
  vipNumber      = 'VIP 10';
  borderGradient = 'linear-gradient(to right, #ffb800, #ff9900)';
  glowShadow     = '0 0 15px rgba(255,179,0,0.4)';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['variant']) {
      this.updateStyles();
    }
  }

  private updateStyles() {
    switch (this.variant) {
      case 'major':
        this.vipNumber      = 'VIP 20';
        this.borderGradient = 'linear-gradient(to right, #ff4d4d, #cc0000)';
        this.glowShadow     = '0 0 18px rgba(255,60,60,0.7)';
        break;
      case 'grand':
        this.vipNumber      = 'VIP 30';
        this.borderGradient = 'linear-gradient(to right, #66ccff, #0066cc)';
        this.glowShadow     = '0 0 18px rgba(80,170,255,0.7)';
        break;
      default:
        this.vipNumber      = 'VIP 10';
        this.borderGradient = 'linear-gradient(to right, #ffb800, #ff9900)';
        this.glowShadow     = '0 0 15px rgba(255,179,0,0.4)';
    }
  }
}
