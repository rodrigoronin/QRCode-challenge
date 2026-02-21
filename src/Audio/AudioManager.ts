import daggerHitAudio from "./assets/audio/dagger-hit.ogg";

const audioContext = new AudioContext();

async function loadAudio(context: AudioContext, url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await context.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

let soundFX: AudioBuffer;

async function initAudio() {
  await audioContext.resume();
  soundFX = await loadAudio(audioContext, daggerHitAudio);
}

function startSoundFX() {
  playAudio(audioContext, soundFX, {
    loop: false,
  });
  keepAudioAlive(audioContext);
}

function playAudio(
  context: AudioContext,
  buffer: AudioBuffer,
  options?: {
    loop?: boolean;
    volume?: number;
    pitchMin?: number;
    pitchMax?: number;
  },
): AudioBufferSourceNode {
  const source: AudioBufferSourceNode = context.createBufferSource();
  source.buffer = buffer;
  source.loop = options?.loop ?? false;

  // random pitch to make the sound more diverse
  source.playbackRate.value = randomRange(options?.pitchMin ?? 0.95, options?.pitchMax ?? 1.05);

  const gainNode = context.createGain();
  gainNode.gain.value = options?.volume ?? randomRange(0.2, 0.3);

  source.connect(gainNode);
  gainNode.connect(context.destination);

  source.start(0, 0.31);
  return source;
}

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// TODO: remove this listener and create an AudioManager to handle audio configuration and initialization
window.addEventListener("keydown", async (e: KeyboardEvent) => {
  if (e.key === "i") await initAudio();

  if (e.key === "j") startSoundFX();
});

function keepAudioAlive(context: AudioContext) {
  const source = context.createBufferSource();
  source.buffer = soundFX;
  source.loop = true;

  const gain = context.createGain();
  gain.gain.value = 0.000001; // virtualmente silencioso

  source.connect(gain);
  gain.connect(context.destination);

  source.start();
}
