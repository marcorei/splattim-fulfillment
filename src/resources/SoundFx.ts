export class SoundFx {
    ngyes() : string {
        return this.ssml('https://s3.amazonaws.com/splattim-assets/sounds/ngyes.mp3')
    } 

    squeemy() : string {
        return this.ssml('https://s3.amazonaws.com/splattim-assets/sounds/squeemy.mp3')
    } 

    private ssml(content: string) : string {
        return `<audio src="${content}"/>`
    }
}