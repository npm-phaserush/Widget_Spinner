import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { Subscription } from 'rxjs';
import { PrizesCard } from '../prizes-card/prizes-card';
import { Level } from '../level/level';
import { SpinWheelService, SlicePrize } from '../../services/spin-wheel.service';

@Component({
  selector: 'app-body',
  imports: [CommonModule, PrizesCard, Level],
  standalone: true,
  templateUrl: './body.html',
  styleUrls: ['./body.css'],
})
export class Body implements AfterViewInit, OnDestroy {
  @ViewChild('wheel') wheel!: ElementRef;
  @ViewChild('winnerBanner') winnerBanner!: ElementRef;
  @ViewChild('winnerTextRef') winnerTextEl!: ElementRef<HTMLSpanElement>;
  @ViewChild('rimImg') rimImg!: ElementRef<HTMLImageElement>;
  @ViewChild('rimBulbs') rimBulbs!: ElementRef<HTMLElement>;
  @ViewChild('arrowBtn') arrowBtn!: ElementRef<HTMLElement>;

  private spinWheelService = inject(SpinWheelService);
  private configSub: Subscription | null = null;

  // Loaded from service — changes per variant
  slices: SlicePrize[] = [];
  isLoading = true;

  winnerText = '';
  winnerImage = '';
  spinCount = 3;
  isSpinning = false;
  rotation = 0;
  currentVariant: 'minor' | 'major' | 'grand' = 'minor';
  selectedVariant: 'minor' | 'major' | 'grand' = 'minor';
  @Output() variantChange = new EventEmitter<'minor' | 'major' | 'grand'>();

  // Pre-computed variant-dependent properties — updated only when variant changes
  rimImage = 'assets/images/rim.png';
  sliceBackgrounds: string[] = [];
  bulbGradient = '';
  bulbBaseColor = '';
  bulbGlow0 = '';
  bulbGlow1 = '';
  bulbBorderColor = '';
  rimGlow0 = '';
  rimGlow1 = '';
  rimFilterA = '';
  rimFilterB = '';

  // Recomputed after slices load (depend on slice count)
  sliceTransforms: string[] = [];
  labelPositions: string[] = [];

  private variantTl: gsap.core.Timeline | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.loadConfig(this.currentVariant);
    Promise.resolve().then(() => this.variantChange.emit(this.currentVariant));
    this.selectedVariant = this.currentVariant;
  }

  ngOnDestroy() {
    this.configSub?.unsubscribe();
    if (this.variantTl) {
      this.variantTl.kill();
      this.variantTl = null;
    }
    gsap.killTweensOf(this.wheel?.nativeElement);
    gsap.killTweensOf(this.winnerBanner?.nativeElement);
  }

  private loadConfig(variant: 'minor' | 'major' | 'grand') {
    this.configSub?.unsubscribe();
    this.isLoading = true;

    this.configSub = this.spinWheelService.getWheelConfig(variant).subscribe(config => {
      this.slices = config.slices;
      this.recomputeSliceArrays();
      this.updateVariantStyles();
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  // Recompute transforms + positions whenever slice count changes
  private recomputeSliceArrays() {
    const total = this.slices.length;
    const sliceAngle = 360 / total;

    this.sliceTransforms = this.slices.map((_, i) =>
      `rotate(${i * sliceAngle}deg) skewY(${90 - sliceAngle}deg)`
    );
    this.labelPositions = this.slices.map((_, i) => {
      const angle = i * sliceAngle + sliceAngle / 2 - 90;
      const rad = (angle * Math.PI) / 180;
      const x = Math.cos(rad) * 80;
      const y = Math.sin(rad) * 80;
      return `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle + 90}deg)`;
    });
  }

  // Called once per variant change — never on every CD cycle
  private updateVariantStyles() {
    const v = this.currentVariant;
    const isMajor = v === 'major';
    const isMinor = v === 'minor';

    this.rimImage = isMajor
      ? 'assets/images/rim-red.png'
      : isMinor
        ? 'assets/images/rim.png'
        : 'assets/images/rim-blue.png';

    this.sliceBackgrounds = this.slices.map((_, i) =>
      this.computeSliceBackground(v, i)
    );
    this.bulbGradient    = this.computeSliceBackground(v);
    this.bulbBaseColor   = isMajor ? '#ff2d2d' : isMinor ? '#ffb400' : '#2d9cff';
    this.bulbGlow0       = isMajor ? 'rgba(255,60,60,0.6)'    : isMinor ? 'rgba(255,200,0,0.6)'    : 'rgba(100,180,255,0.6)';
    this.bulbGlow1       = isMajor ? 'rgba(255,60,60,0.9)'    : isMinor ? 'rgba(255,200,0,0.9)'    : 'rgba(100,180,255,0.9)';
    this.bulbBorderColor = isMajor ? '#ff2d2d'                : isMinor ? '#ffd700'                : '#2d9cff';
    this.rimGlow0        = isMajor ? 'rgba(255,70,70,0.6)'    : isMinor ? 'rgba(255,220,60,0.6)'   : 'rgba(120,200,255,0.6)';
    this.rimGlow1        = isMajor ? 'rgba(255,40,40,0.4)'    : isMinor ? 'rgba(255,180,0,0.4)'    : 'rgba(60,150,255,0.4)';
    this.rimFilterA      = isMajor ? 'rgba(255, 50, 50, 0.8)' : isMinor ? 'rgba(255, 220, 50, 0.8)': 'rgba(80, 170, 255, 0.8)';
    this.rimFilterB      = isMajor ? 'rgba(255, 0, 0, 0.6)'   : isMinor ? 'rgba(255, 160, 0, 0.6)' : 'rgba(0, 110, 200, 0.6)';
  }

  private computeSliceBackground(variant: string, index?: number): string {
    const even = typeof index === 'number' && index % 2 === 0;
    switch (variant) {
      case 'major':
        return even
          ? 'radial-gradient(circle at center, #ff9999 0%, #e60000 50%, #993333 100%)'
          : 'radial-gradient(circle at center, #ff4d4d 0%, #cc0000 50%, #660000 100%)';
      case 'grand':
        return even
          ? 'radial-gradient(circle at center, #b3e6ff 0%, #66a3ff 50%, #334d80 100%)'
          : 'radial-gradient(circle at center, #66ccff 0%, #0066cc 50%, #001f4d 100%)';
      default:
        return even
          ? 'radial-gradient(circle at center, #ffd066 0%, #ffb84d 50%, #cc6600 100%)'
          : 'radial-gradient(circle at center, #ffae00 0%, #ff9900 50%, #a84b00 100%)';
    }
  }

  onVariantPicked(variant: 'minor' | 'major' | 'grand') {
    if (!variant) return;
    this.selectedVariant = variant;
    if (variant !== this.currentVariant) {
      this.animateVariantChange(variant);
    }
  }

  private animateVariantChange(next: 'minor' | 'major' | 'grand') {
    if (this.variantTl) {
      this.variantTl.kill();
      this.variantTl = null;
    }

    const wheelEl  = this.wheel?.nativeElement as HTMLElement;
    const rimEl    = this.rimImg?.nativeElement as HTMLElement;
    const bulbsEl  = this.rimBulbs?.nativeElement as HTMLElement;
    const arrowEl  = this.arrowBtn?.nativeElement as HTMLElement;
    const slicesEl = wheelEl?.querySelectorAll('.slice') || [];
    const bulbEls  = Array.from(bulbsEl?.querySelectorAll('.bulb') || []) as HTMLElement[];

    // Disable CSS bulbGlow keyframe so GSAP can fully control opacity
    bulbEls.forEach(el => { el.style.animation = 'none'; });

    this.variantTl = gsap.timeline({
      onComplete: () => {
        bulbEls.forEach(el => {
          el.style.animation = '';
          gsap.set(el, { clearProps: 'opacity,scale' });
        });
      }
    });
    this.variantTl
      .to(wheelEl, { rotation: '+=360', duration: 0.55, ease: 'power2.inOut' }, 0)
      .to(rimEl, { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0.05)
      .to(slicesEl, { opacity: 0.6, duration: 0.2, ease: 'power1.out' }, '<')
      .to(bulbEls, { opacity: 0, duration: 0.2, ease: 'power1.out' }, '<')
      .to(arrowEl, { opacity: 0.6, duration: 0.2, ease: 'power1.out' }, '<')
      .call(() => {
        this.currentVariant = next;
        // loadConfig sets new slices + updateVariantStyles + detectChanges
        this.loadConfig(next);
        this.variantChange.emit(next);
      })
      .to(rimEl, { opacity: 1, duration: 0.25, ease: 'power1.in' }, '>-0.05')
      .to(slicesEl, { opacity: 1, duration: 0.25, ease: 'power1.in' }, '<')
      .to(bulbEls, { opacity: 1, duration: 0.25, ease: 'power1.in' }, '<')
      .to(arrowEl, { opacity: 1, duration: 0.1, ease: 'power1.in' }, '<')
      .to(arrowEl, { scale: 1.2, y: -6, duration: 0.12, ease: 'back.out(2)' }, '>-0.05')
      .to(arrowEl, { scale: 1, y: 0, duration: 0.2, ease: 'back.inOut(2)' }, '>')
      .to(bulbEls, {
        scale: 1.15,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        stagger: 0.02,
        ease: 'power1.inOut',
      }, '>-0.1');
  }

  spinWheel() {
    if (this.isSpinning || this.spinCount <= 0 || this.isLoading) return;

    this.spinCount--;
    this.isSpinning = true;

    const totalSlices = this.slices.length;
    const sliceAngle = 360 / totalSlices;
    const randomIndex = Math.floor(Math.random() * totalSlices);
    const targetAngle = randomIndex * sliceAngle + sliceAngle / 2;

    const currentMod = ((this.rotation % 360) + 360) % 360;
    const desiredMod = (360 - targetAngle) % 360;
    const modDelta = (desiredMod - currentMod + 360) % 360;
    const finalRotation = this.rotation + 360 * 5 + modDelta;
    this.rotation = finalRotation;

    gsap.to(this.wheel.nativeElement, {
      rotation: finalRotation,
      duration: 1,
      ease: 'power4.out',
      onComplete: () => {
        this.isSpinning = false;
        const normalized = ((finalRotation % 360) + 360) % 360;
        const angleFromTop = (360 - normalized) % 360;
        const winnerIndex = Math.floor(angleFromTop / sliceAngle) % totalSlices;

        const prize = this.slices[winnerIndex];
        const prizeText = (prize?.title || '').replace(/<br\s*\/?>/gi, ' ');
        const prizeImg = prize?.image || '';
        this.showWinningAnimation(prizeText || 'Unknown Prize', prizeImg);
        this.launchConfetti();
        gsap.to(this.wheel.nativeElement, {
          rotation: finalRotation + 5,
          duration: 0.3,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 1,
        });
      },
    });
  }

  launchConfetti() {
    const end = Date.now() + 400;
    let skip = false;
    const frame = () => {
      skip = !skip;
      if (!skip) {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
      }
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }

  onContinue() {
    try {
      const banner: HTMLElement = this.winnerBanner?.nativeElement;
      if (banner) {
        gsap.to(banner, { opacity: 0, scale: 0.9, duration: 0.3, ease: 'power1.inOut' });
      }
    } catch {}
  }

  showWinningAnimation(prize: string, imgSrc: string) {
    const sanitizedPrize = (prize || '').replace(/<br\s*\/?>/gi, ' ');
    this.winnerText = `You won: ${sanitizedPrize}`;
    this.winnerImage = imgSrc;
    this.cdr.detectChanges();
    this.fitWinnerText();
    const banner = this.winnerBanner.nativeElement;
    const img: HTMLImageElement | null = banner.querySelector('img');
    if (img && !img.complete) {
      img.onload = () => this.fitWinnerText();
    }
    gsap.set(banner, { opacity: 0, scale: 0.5, y: 50 });
    gsap.to(banner, { opacity: 1, scale: 1.2, y: 0, duration: 1, ease: 'back.out(1.7)' });
    gsap.to(banner, { scale: 1, duration: 0.4, delay: 1, ease: 'back.inOut(2)' });
  }

  private fitWinnerText() {
    try {
      const banner: HTMLElement = this.winnerBanner?.nativeElement;
      const textEl: HTMLElement = this.winnerTextEl?.nativeElement;
      if (!banner || !textEl) return;

      textEl.style.whiteSpace = 'nowrap';
      textEl.style.fontSize = '';

      const computed = window.getComputedStyle(textEl);
      const bannerStyles = window.getComputedStyle(banner);
      let baseSize = parseFloat(computed.fontSize || '16');
      if (!isFinite(baseSize) || baseSize <= 0) baseSize = 16;
      const paddingLeft = parseFloat(bannerStyles.paddingLeft || '0');
      const paddingRight = parseFloat(bannerStyles.paddingRight || '0');
      const gap = parseFloat((bannerStyles as any).gap || bannerStyles.columnGap || '0');
      const imgEl = banner.querySelector('img') as HTMLElement | null;
      const imgWidth = imgEl ? imgEl.clientWidth : 0;

      const maxBannerWidth = Math.floor(window.innerWidth * 0.9);
      let available = maxBannerWidth - paddingLeft - paddingRight - imgWidth - gap - 4;
      if (!isFinite(available) || available < 0) available = 0;

      const minSize = 10;
      let lo = minSize;
      let hi = baseSize;
      textEl.style.fontSize = hi + 'px';
      if (textEl.scrollWidth <= available) return;

      while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        textEl.style.fontSize = mid + 'px';
        if (textEl.scrollWidth > available) hi = mid;
        else lo = mid;
      }
      textEl.style.fontSize = lo + 'px';
    } catch {}
  }
}
