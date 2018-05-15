
type ReplacementType = 'phonetic' | 'simple'

type Replacement = {
    value: string,
    type: ReplacementType
}

const en = new Map<string, Replacement>([
    ['&', { value: 'and', type: 'simple' }],
])

const de = new Map<string, Replacement>([
    ['Splatfest', { value: 'splætfəst', type: 'phonetic' }],
    ['&', { value: 'und', type: 'simple' }],
])

export class SsmlHelper {
    private mapObj: Map<string, Replacement>

    constructor(lang: string) {
        this.mapObj = this.getMap(lang)   
    }

    public replace(input: string) : string {
        if (this.mapObj.size == 0) {
            return input
        }
        return this.replaceWithMap(input, this.mapObj)
    }

    private getMap(lang: string) : Map<string, Replacement> {
        switch (lang) {
            case 'de': return de
            default: return en
        }
    }

    private replaceWithMap(input: string, mapObj: Map<string, Replacement>) : string {
        var regex = new RegExp(Array.from(mapObj.keys()).join('|'), 'g')
        return input.replace(regex, matched => 
            this.makeReplacementString(matched, mapObj.get(matched)!))
    }

    private makeReplacementString(matched: string, replacement: Replacement) : string {
        switch (replacement.type) {
            case 'phonetic':
                return `<phoneme alphabet="ipa" ph="${replacement.value}">${matched}</phoneme>`
            case 'simple':
            default:  
                return replacement.value
        }
    }
}