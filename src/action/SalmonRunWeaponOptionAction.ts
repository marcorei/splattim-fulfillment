import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp'
const seperator = '_'

export const name = 'grizzco-option-weapon'

export function buildOptionKey(weaponName: string): string {
    return [
        'SRWEAPON',
        weaponName
    ].join(seperator)
}

export function handler(app: I18NDialogflowApp) {
    const optionKeyParts = app.getSelectedOption().split(seperator)
    if (optionKeyParts.length < 2) {
        return app.tell(app.getDict().o_srweapon_000)
    }
    const weaponName = optionKeyParts[1]

    if (Math.random() > 0.5) {
        return app.tell(app.getDict().o_srweapon_001(weaponName))
    }

    return app.tell(app.getDict().o_srweapon_002(weaponName))
}