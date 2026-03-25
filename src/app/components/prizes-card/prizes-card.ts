import { Component, Input, ElementRef, AfterViewInit, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-prizes-card',
  standalone: true,
  imports: [],
  templateUrl: './prizes-card.html',
  styleUrl: './prizes-card.css',
})
export class PrizesCard implements AfterViewInit, OnChanges, OnDestroy {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() image: string = '';
  @Input() titleImage: string = '';
  @Input() subtitleImage: string = '';
  @Input() titleAlt: string = '';
  @Input() subtitleAlt: string = '';
  @Input() variant: 'minor' | 'major' | 'grand' | '' = '';
  @Input() active: boolean = false; 
  @Output() picked = new EventEmitter<'minor' | 'major' | 'grand'>();

  constructor(private el: ElementRef) {}

  private elements!: { card: HTMLElement; image: HTMLElement | null; titleImg: HTMLElement | null; subtitleImg: HTMLElement | null };
  private glowColor = '#FFD700';
  private effectiveVariant: 'minor' | 'major' | 'grand' | '' = '';
  private initialized = false;
  private onHoverEnter = () => {
    if (!this.active && this.effectiveVariant) this.picked.emit(this.effectiveVariant);
  };
  private onHoverLeave = () => {
    if (!this.active) this.playLeaveAnimation();
  };

  ngAfterViewInit() {
    this.cacheElements();
    this.resolveVariantAndGlow();
    this.attachHoverHandlers();
    this.applyInitialActiveState();
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.initialized) return;
    if (changes['active']) {
      // When active flag changes externally, apply or remove highlight accordingly.
      if (this.active) {
        this.resolveVariantAndGlow();
        this.playEnterAnimation();
      } else {
        this.playLeaveAnimation();
      }
    }
  }

  private cacheElements() {
    this.elements = {
      card: this.el.nativeElement.querySelector('div'),
      image: this.el.nativeElement.querySelector('.wheel-img'),
      titleImg: this.el.nativeElement.querySelector('.title-img'),
      subtitleImg: this.el.nativeElement.querySelector('.subtitle-img'),
    };
  }

  private resolveVariantAndGlow() {
    const parsedTitle = (this.title || '').toLowerCase();
    this.effectiveVariant = this.variant || (parsedTitle.includes('minor') ? 'minor' : parsedTitle.includes('major') ? 'major' : parsedTitle.includes('grand') ? 'grand' : '');
    this.glowColor = this.effectiveVariant === 'minor' ? '#FFD700' : this.effectiveVariant === 'major' ? '#FF2D2D' : this.effectiveVariant === 'grand' ? '#009DFF' : '#FFD700';
  }

  private get animations() {
    return {
      enter: {
        image: {
          rotation: 360,
          scale: 1.15,
          filter: `grayscale(0%) drop-shadow(0 0 40px ${this.glowColor})`,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
        },
        card: {
          borderColor: this.glowColor,
          boxShadow: `0 0 25px 6px ${this.glowColor}`,
          duration: 0.4,
        },
        titleImg: {
          filter: `grayscale(0%) drop-shadow(0 0 12px ${this.glowColor})`,
          scale: 1.05,
          duration: 0.4,
          ease: 'power2.out',
        },
        subtitleImg: {
          filter: `grayscale(0%) drop-shadow(0 0 8px ${this.glowColor})`,
          scale: 1.03,
          duration: 0.4,
          ease: 'power2.out',
        },
      },
      leave: {
        image: {
          rotation: -50,
          scale: 1,
          filter: 'grayscale(100%) drop-shadow(0 0 0 transparent)',
          duration: 0.4,
          ease: 'power2.inOut',
        },
        card: {
          borderColor: 'transparent',
          boxShadow: 'none',
          duration: 0.3,
        },
        titleImg: {
          filter: 'grayscale(100%) drop-shadow(0 0 0 transparent)',
          scale: 1,
          duration: 0.3,
        },
        subtitleImg: {
          filter: 'grayscale(100%) drop-shadow(0 0 0 transparent)',
          scale: 1,
          duration: 0.3,
        },
      },
    };
  }

  private animate(el: HTMLElement | null, props: Record<string, any>) {
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.to(el, { overwrite: 'auto', ...props });
  }

  private playEnterAnimation() {
    this.animate(this.elements.image, this.animations.enter.image);
    this.animate(this.elements.card, this.animations.enter.card);
    this.animate(this.elements.titleImg, this.animations.enter.titleImg);
    this.animate(this.elements.subtitleImg, this.animations.enter.subtitleImg);
  }

  private playLeaveAnimation() {
    this.animate(this.elements.image, this.animations.leave.image);
    this.animate(this.elements.card, this.animations.leave.card);
    this.animate(this.elements.titleImg, this.animations.leave.titleImg);
    this.animate(this.elements.subtitleImg, this.animations.leave.subtitleImg);
  }

  private attachHoverHandlers() {
    this.elements.card.addEventListener('mouseenter', this.onHoverEnter);
    this.elements.card.addEventListener('mouseleave', this.onHoverLeave);
  }

  ngOnDestroy() {
    if (this.elements?.card) {
      gsap.killTweensOf(this.elements.card);
      this.elements.card.removeEventListener('mouseenter', this.onHoverEnter);
      this.elements.card.removeEventListener('mouseleave', this.onHoverLeave);
    }
    if (this.elements?.image) gsap.killTweensOf(this.elements.image);
    if (this.elements?.titleImg) gsap.killTweensOf(this.elements.titleImg);
    if (this.elements?.subtitleImg) gsap.killTweensOf(this.elements.subtitleImg);
  }

  private applyInitialActiveState() {
    if (this.active) {
      this.playEnterAnimation();
    } else {
      this.playLeaveAnimation();
    }
  }
}
