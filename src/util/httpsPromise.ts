import * as https from 'https'
import { isNullOrUndefined } from 'util';

export function loadContent(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const request = https.get(url, response => {
            if (isNullOrUndefined(response.statusCode) || response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error(`Failed to load content from ${url}, status code: ${response.statusCode}`))
            }

            const body: any[] = []
            response.on('data', chunk => body.push(chunk))
            response.on('end', () => resolve(body.join('')))
        })
        request.on('error', (error) => reject(error))
    })
}