import './TextService.scss';

export class TextService {
    static getTextLength({fontSize, fontFamily, text, letterSpacing}) {
        let canvas = TextService.getTextLength.canvas || (TextService.getTextLength.canvas = document.createElement("canvas"));
        let context = canvas.getContext("2d");
        canvas.style.letterSpacing = letterSpacing;
        context.font = `${fontSize} ${fontFamily}`;
        let metrics = context.measureText(text);
        return Math.round(metrics.width);
    }

    static isGreater({width, fontSize, fontFamily, letterSpacing, text}) {
        let w = TextService.getTextLength({fontSize, fontFamily, text, letterSpacing});
        return w > width;
    }
}
