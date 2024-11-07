declare module 'webaudiofont' {
    export class WebAudioFontPlayer {
        loader: {
            startLoad: (url: string, name: string, callback: () => void) => void;
        };
        queueWaveTable: (context: AudioContext, url: string, note: string, time: number, duration: number) => void;
    }
}