export function parse<T>(json: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        try {
            const obj:T = JSON.parse(json)
            resolve(obj)
        } catch(error) {
            reject(error)
        } 
    })
}