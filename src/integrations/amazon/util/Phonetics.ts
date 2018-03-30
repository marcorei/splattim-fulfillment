
const en = new Map<string, string>([
])

const de = new Map<string, string>([
    ['Splatfest', 'splætfəst']
])

export class Phonetics {
    private mapObj: Map<string, string>

    constructor(lang: string) {
        this.mapObj = this.getMap(lang)   
    }

    public replace(input: string) : string {
        if (this.mapObj.size == 0) {
            return input
        }
        return this.replaceWithMap(input, this.mapObj)
    }

    private getMap(lang: string) : Map<string, string> {
        switch (lang) {
            case 'de': return de
            default: return en
        }
    }

    private replaceWithMap(input: string, mapObj: Map<string, string>) : string {
        var regex = new RegExp(Array.from(mapObj.keys()).join('|'), 'g')
        return input.replace(regex, matched => {
            const phonetic = mapObj.get(matched)
            return `<phoneme alphabet="ipa" ph="${phonetic}">${matched}</phoneme>`
        })
    }
}