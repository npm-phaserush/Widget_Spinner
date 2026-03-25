import { Component, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer implements AfterViewInit, OnDestroy {
  @Input() variant: 'minor' | 'major' | 'grand' = 'minor';

  private tl: gsap.core.Timeline | null = null;
  private listEl: Element | null = null;
  private onMouseEnter = () => {
    if (!this.listEl || !this.tl) return;
    gsap.to(this.listEl, { y: '0%', duration: 0.5, ease: 'power1.out' });
    this.tl.pause();
  };
  private onMouseLeave = () => {
    if (!this.listEl || !this.tl) return;
    gsap.set(this.listEl, { y: '0%' });
    this.tl.restart();
  };

  getJackpotAmount(): string {
    switch (this.variant) {
      case 'major': return '₱198,765,432';
      case 'grand': return '₱298,765,432';
      case 'minor':
      default: return '₱98,765,432';
    }
  }

  getJackpotGlow(): string {
    switch (this.variant) {
      case 'major': return '0 0 18px rgba(255,60,60,0.6), 0 0 30px rgba(255,0,0,0.4)';
      case 'grand': return '0 0 18px rgba(80,170,255,0.7), 0 0 30px rgba(0,110,200,0.5)';
      case 'minor':
      default: return '0 0 15px rgba(255,204,51,0.2), 0 0 25px rgba(0,0,0,0.8)';
    }
  }

  ngAfterViewInit() {
    this.listEl = document.querySelector('#winnerList');

    if (this.listEl) {
      this.tl = gsap.timeline({ repeat: -1, ease: 'power1.inOut', repeatDelay: 0 });

      this.tl.to(this.listEl, { y: '-90%', duration: 5 })
        .to(this.listEl, { y: '0%', duration: 5 })
        .to(this.listEl, { y: '90%', duration: 5 })
        .to(this.listEl, { y: '0%', duration: 5 });

      this.listEl.addEventListener('mouseenter', this.onMouseEnter);
      this.listEl.addEventListener('mouseleave', this.onMouseLeave);
    }
  }

  ngOnDestroy() {
    if (this.tl) {
      this.tl.kill();
      this.tl = null;
    }
    if (this.listEl) {
      this.listEl.removeEventListener('mouseenter', this.onMouseEnter);
      this.listEl.removeEventListener('mouseleave', this.onMouseLeave);
      this.listEl = null;
    }
  }
}
