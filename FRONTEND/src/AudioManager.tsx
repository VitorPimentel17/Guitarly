import * as Tone from 'tone';

const SAMPLE_DIRECTORY = '/src/SamplesACOUSTIC/'; 

class AudioManager {
    private notePlayers: { [key: string]: Tone.Player } = {};
    private volume: number;

    constructor() {
        this.volume = 10;
        this.loadSamples();
    }

    private async loadSamples() {
        const samples = {
            "A2": await this.loadSample('A2.wav'),
            "A3": await this.loadSample('A3.wav'),
            "A4": await this.loadSample('A4.wav'),
            "A5": await this.loadSample('A5.wav'),
            "A#2": await this.loadSample('As2.wav'),
            "A#3": await this.loadSample('As3.wav'),
            "A#4": await this.loadSample('As4.wav'),
            "A#5": await this.loadSample('As5.wav'),
            "B2": await this.loadSample('B2.wav'),
            "B3": await this.loadSample('B3.wav'),
            "B4": await this.loadSample('B4.wav'),
            "B5": await this.loadSample('B5.wav'),
            "C3": await this.loadSample('C3.wav'),
            "C4": await this.loadSample('C4.wav'),
            "C5": await this.loadSample('C5.wav'),
            "C6": await this.loadSample('C6.wav'),
            "C#3": await this.loadSample('Cs3.wav'),
            "C#4": await this.loadSample('Cs4.wav'),
            "C#5": await this.loadSample('Cs5.wav'),
            "C#6": await this.loadSample('Cs6.wav'),
            "D3": await this.loadSample('D3.wav'),
            "D4": await this.loadSample('D4.wav'),
            "D5": await this.loadSample('D5.wav'),
            "D6": await this.loadSample('D6.wav'),
            "D#3": await this.loadSample('Ds3.wav'),
            "D#4": await this.loadSample('Ds4.wav'),
            "D#5": await this.loadSample('Ds5.wav'),
            "D#6": await this.loadSample('Ds6.wav'),
            "E2": await this.loadSample('E2.wav'),
            "E3": await this.loadSample('E3.wav'),
            "E4": await this.loadSample('E4.wav'),
            "E5": await this.loadSample('E5.wav'),
            "E6": await this.loadSample('E6.wav'),
            "F2": await this.loadSample('F2.wav'),
            "F3": await this.loadSample('F3.wav'),
            "F4": await this.loadSample('F4.wav'),
            "F5": await this.loadSample('F5.wav'),
            "F6": await this.loadSample('F6.wav'),
            "F#2": await this.loadSample('Fs2.wav'),
            "F#3": await this.loadSample('Fs3.wav'),
            "F#4": await this.loadSample('Fs4.wav'),
            "F#5": await this.loadSample('Fs5.wav'),
            "G2": await this.loadSample('G2.wav'),
            "G3": await this.loadSample('G3.wav'),
            "G4": await this.loadSample('G4.wav'),
            "G5": await this.loadSample('G5.wav'),
            "G#2": await this.loadSample('Gs2.wav'),
            "G#3": await this.loadSample('Gs3.wav'),
            "G#4": await this.loadSample('Gs4.wav'),
            "G#5": await this.loadSample('Gs5.wav'),
        };

        for (const note in samples) {
            this.notePlayers[note] = new Tone.Player(samples[note]).toDestination();
            this.notePlayers[note].volume.value = this.volume;
        }
    }

    private loadSample(fileName: string): Promise<string> {
        return new Promise((resolve) => {
            resolve(`${SAMPLE_DIRECTORY}${fileName}`);
        });
    }

    public playNote(note: string) {
        const player = this.notePlayers[note];
        if (player) {
            player.start();
        }
    }

    public setVolume(newVolume: number) {
        this.volume = newVolume;
        Object.values(this.notePlayers).forEach(player => {
            player.volume.value = newVolume;
        });
    }

    public getVolume() {
        return this.volume;
    }
}

const audioManager = new AudioManager();
export default audioManager;