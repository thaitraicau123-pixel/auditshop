/**
 * Hiệu ứng âm thanh chân thực sử dụng Web Audio API (Không cần tải file mp3 ngoài)
 */

class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Âm thanh Báo động khẩn cấp (Emergency Alarm / Alert Siren)
  playAlarm() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Hú còi báo động từ 800Hz xuống 400Hz lặp lại 2 lần
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.2);
      osc.frequency.setValueAtTime(850, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.45);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  // Âm thanh Chiến thắng huy hoàng (Victory Fanfare / Radiant Chime)
  playVictory() {
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      const now = this.ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = now + index * 0.08;
        const duration = 1.2;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }
}

export const sounds = new SoundEffects();
