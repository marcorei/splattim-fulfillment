import { dict as index } from './en'
import * as sched from '../entity/api/Schedules'
import * as gear from '../entity/api/Gear'
import * as coop from '../entity/api/SalmonRunSchedules'
import { isNullOrUndefined } from 'util';

export const dict: typeof index = {
    global_error_default: 'Trauriges woomy. Mich hat\'s erwischt!',
    global_error_missing_param: 'Trauriges woomy. Ich brauche mehr Infos!',

    api_sched_mode: (i: sched.GameMode): string => {
        switch (i.key) {
            case sched.gameModeKeyValues.league: return 'Ligakampf'
            case sched.gameModeKeyValues.ranked: return 'Rangkampf'
            case sched.gameModeKeyValues.regular: return 'Standardkampf'
            default: return i.name
        }
    },
    api_sched_rule: (i: sched.Rule): string => {
        switch (i.key) {
            case sched.gameRuleKeyValues.blitz: return 'Muschelchaos'
            case sched.gameRuleKeyValues.rainmaker: return 'Goldfisch'
            case sched.gameRuleKeyValues.tower: return 'Turm-Kommando'
            case sched.gameRuleKeyValues.turf: return 'Revierkampf'
            case sched.gameRuleKeyValues.zones: return 'Herrschaft'
            default: return i.name
        }   
    },
    api_sched_stage: (i: sched.Stage): string => {
        const id = parseInt(i.id)
        const stageName = dict.stage_name(id)
        return isNullOrUndefined(stageName) ? i.name : stageName
    },
    api_gear_item: (i: gear.Gear): string => i.name,
    api_gear_brand: (i: gear.Brand): string => i.name,
    api_gear_skill: (i: gear.Skill): string => i.name,
    api_grizz_stage: (i: coop.Stage): string => {
        switch (i.name) { // No key available
            case 'Spawning Grounds': return 'Salmoninden-Damm'
            case 'Salmonid Smokeyard': return 'Räucherwerk'
            case 'Marooner\'s Bay': return 'Schiffswrack-Insel'
            case 'Lost Outpost': return 'Siedlungsruine'
            default: return i.name
        }
    },
    api_grizz_weapon: (i: coop.Weapon): string => i.name,

    stage_name: (id: number): string | undefined => {
        const names = [
            'Korallenviertel', // 0 - The Reef
            'Molluskelbude', // 1 - Musselforge Fitness
            'Seeigel-Rockbühne', // 2 - Starfish Mainstage
            'Störwerft', // 3 - Sturgeon Shipyard
            'Perlmutt-Akademie', // 4 - Inkblot Art Academy
            'Buckelwal-Piste', // 5 - Humpback Pump Track
            'Manta Maria', // 6 - Manta Maria
            'Heilbutt-Hafen', // 7 - Port Mackerel
            'Muränentürme', // 8 - Moray Towers
            'Grätenkanal', // 9 - Snapper Canal
            'Tümmlerkuppel', // 10 - Kelp Dome
            'Punkasius-Skatepark', // 11 - Blackbelly Skatepark
            'Abyssal-Museum', // 12 - Shellendorf Institute
            'Cetacea-Markt', // 13 - MakoMart
            'Kofferfisch-Lager', // 14 - Walleye Warehouse
        ]
        if (id < names.length) {
            return names[id]
        }
        return undefined
    },

    // [Action] Schedules

    a_sched_000_s: (url: string) => `Ich kann Dir nicht helfen. Aber schau mal auf ${url}!`,
    a_sched_000_t: 'Ich kann Dir nicht helfen. Aber schau mal auf dieser Website nach!',
    a_sched_002_a: (rule: string, mode: string, stage1: string, stage2: string) => `Du kannst ${rule} im ${mode} in den Arenen ${stage1} und ${stage2} spielen.`,
    a_sched_002_s: (rule: string, mode: string, stage1: string, stage2: string) => `Du kannst ${rule} im ${mode} in den Arenen ${stage1} und ${stage2} spielen. Welche magst Du lieber?`,
    a_sched_002_t: (rule: string, mode: string) => `Du kannst ${rule} im ${mode} auf diesen Arenen spielen. Welche magst Du lieber?`,
    a_sched_003: (mode: string) => `Aktuelle Arenen für ${mode}`,
    
    a_sched_004: 'Hier, alle aktuellen Arenen. Auf welcher wirst du spielen?',

    a_sched_005_start: 'Spiele',
    a_sched_005_middle: (mode: string, stage1: string, stage2: string) => `${mode} in den Arenen ${stage1} und ${stage2}`,
    a_sched_005_connector: ' und ',
    a_sched_005_end: '! Auf welcher wirst du spielen?',

    // [Action] All Schedules

    a_asched_error_too_much: 'Das ist eine Menge Info. Such Dir einen Spiel-Modus aus!',
    a_asched_error_empty_data: 'Hm. Die Infos sind gerade nicht verfügbar.',
    a_asched_000_a: (mode: string, rule1: string, stage1a: string, stage1b: string, rule2: string, time2: string, stage2a: string, stage2b: string) => `Hier sind die kommenden Arenen für ${mode}: Aktuell ist ${rule1} in den Arenen ${stage1a} und ${stage1b} aktiv. In ${time2} kannst Du ${rule2} in den Arenen ${stage2a} und ${stage2b} spielen.`,
    a_asched_000_s: (mode: string, rule1: string, stage1a: string, stage1b: string, rule2: string, time2: string, stage2a: string, stage2b: string) => `Hier sind die kommenden Arenen für ${mode}: Aktuell ist ${rule1} in den Arenen ${stage1a} und ${stage1b} aktiv. In ${time2} kannst Du ${rule2} in den Arenen ${stage2a} und ${stage2b} spielen. Welche Arena ist dein Favorit?`,
    a_asched_000_t: (mode: string) => `Hier sind die kommenden Arenen für ${mode}. Welche Arena ist dein Favorit?`,
    a_asched_001_now: 'jetzt',
    a_asched_001_future: 'in ',

    // [Action] ETA for Rule

    a_eta_error_incomp_mode_all: 'Wenn dir der Spiel-Modus egal ist, dann kannst du gleich anfangen zu spielen!',
    a_eta_error_incomp_mode_regular: 'Im Standardkampf ist immer der gleiche Spiel-Typ!',
    a_eta_error_unknown_mode: 'Hm, diesen Modus kenne ich nicht.',
    a_eta_error_incomp_rule_turf: 'Im Standardkampf kannst du jederzeit Revierkämpfe spielen.',
    a_eta_error_unknown_rule: 'Diesen Spiel-Typ kenne ich nicht.',
    a_eta_000: 'Dieser Spiel-Typ wird erstmal nicht zur Verfügung stehen.',
    a_eta_001_now: 'jetzt',
    a_eta_001_future: 'in ',
    a_eta_002_a: (rule: string, mode: string, time: string, stage1: string, stage2: string) => `Du kannst ${rule} im ${mode} ${time} in den Arenen ${stage1} und ${stage2} spielen!`,
    a_eta_002_s: (rule: string, mode: string, time: string, stage1: string, stage2: string) => `Du kannst ${rule} im ${mode} ${time} in den Arenen ${stage1} und ${stage2} spielen! Welche Arena ist cooler?`,
    a_eta_002_t: (rule: string, mode: string, time: string) => `Du kannst ${rule} im ${mode} ${time} in diesen Arenen spielen. Welche ist cooler?`,
    a_eta_003: 'Arenen',

    // [Action] Stage Schedule

    a_ssched_000: (stage: string) => `${stage} scheint kommt erstmal nicht dran.`,
    a_ssched_001_t: (stage: string) => `Hier sind die nächsten Gelegenheiten in der Arena ${stage} zu spielen.`,
    a_ssched_002_start: (stage: string) => `Die nächsten Gelegenheiten in der Arena ${stage} sind:`,
    a_ssched_002_middle: (rule: string, mode: string, time: string) => `${rule} in ${mode} in ${time}`,
    a_ssched_002_connector: ' und ',
    a_ssched_002_end: '. Wann wirst Du spielen?',

    // [Action] Salmon Run

    a_sr_000: 'Sorry, ich habe keine Infos zu kommenden Salmon Run Zeiten.',
    a_sr_002_a: (stage: string, remaining: string, weapon1: string, weapon2: string, weapon3: string, weapon4: string) => `Herr Bär stellt noch ${remaining} ein! Sammle Fischeier auf der Karte ${stage} mit den Waffen ${weapon1}, ${weapon2}, ${weapon3} und ${weapon4}!`,
    a_sr_002_s: (stage: string, remaining: string, weapon1: string, weapon2: string, weapon3: string, weapon4: string) => `Herr Bär stellt noch ${remaining} ein! Sammle Fischeier auf der Karte ${stage} mit den Waffen ${weapon1}, ${weapon2}, ${weapon3} und ${weapon4}! Mit welcher spielst Du am besten?`,
    a_sr_002_t: (stage: string, remaining: string) => `Herr Bär stellt noch ${remaining} ein, auf ${stage}. Hier sind die verfügbaren Waffen:`,
    a_sr_003_a: (stage: string, eta: string, weapon1: string, weapon2: string, weapon3: string, weapon4: string) => `Salmon Run ist wieder in ${eta} auf der Karte ${stage} geöffnet. Die Waffen sind ${weapon1}, ${weapon2}, ${weapon3} und ${weapon4}.`,
    a_sr_003_s: (stage: string, eta: string, weapon1: string, weapon2: string, weapon3: string, weapon4: string) => `Salmon Run ist wieder in ${eta} auf der Karte ${stage} geöffnet. Die Waffen sind ${weapon1}, ${weapon2}, ${weapon3} und ${weapon4}. Welche ist dein Favorit?`,
    a_sr_003_t: (stage: string, eta: string) => `Salmon Run wird in ${eta} wieder auf der Map ${stage} offen sein. Hier sind die Waffen. Welche ist dein Favorit?`,
    a_sr_004: 'Unbekannt',

    // [Action] Merchandise

    a_merch_000_a: (merch1: string, merch2: string, merch3: string) => `${merch1}, ${merch2}, ${merch3} und drei weitere sind im Angebot.`,
    a_merch_000_s: (merch1: string, merch2: string, merch3: string) => `${merch1}, ${merch2}, ${merch3} und drei weitere sind im Angebot. Ist was für dich dabei?`,
    a_merch_000_t: 'Das hier ist gerade im Angebot. Ist was für Dich dabei?',
    a_merch_001: (skill: string, brand: string, eta: string) => `mit ${skill} von ${brand} (noch ${eta})`,
    a_merch_002: 'Diese Info habe ich gerade nicht. Schau doch mal in der App!',

    // [Action] Splatfest Result

    a_splres_000: (winner: string, loser: string) => `Im letzten Splatfest hat Team ${winner} hat gegen Team ${loser} gewonnen.`,
    a_splres_001: 'Sie haben in allen drei Kategorien gewonnen!',
    a_splres_002: (won1: string, won2: string, lost: string) => `Sie haben ${won1} und ${won2} gewonnen, aber ${lost} verloren.`,
    a_splres_002_votes: 'die Abstimmung',
    a_splres_002_solo: 'Solo-Kämpfe',
    a_splres_002_team: 'Team-Kämpfe',
    a_splres_003: (alpha: string, bravo: string) => `${alpha} gegen ${bravo}`,
    a_splres_004: (name: string, alphaRate: number, bravoRate: number) => `**${name}**: ${alphaRate}% - ${bravoRate}%`,
    a_splres_004_votes: 'Abstimmung',
    a_splres_004_solo: 'Solo',
    a_splres_004_team: 'Team',
    a_splres_005: 'Splafest Übersicht',
    a_splres_006: (winner: string) => `Gewinner: ${winner}`,

    // [Action] Splatfest Upcoming

    a_splup_000: 'Ich habe aktuell keine Informationen zu kommenden Splatfests.',
    a_splup_001: (alpha: string, bravo: string) => `${alpha} gegen ${bravo}`,
    a_splup_002: 'Splafest Übersicht',
    a_splup_003_s: (time: string, alpha: string, bravo: string) => `Es ist Splatfest! ${alpha} gegen ${bravo}. Noch ${time} !`,
    a_splup_003_t: (time: string) => `Es ist Splatfest! Noch ${time}.`,
    a_splup_003_b: (time: string) => `Noch ${time}.`,
    a_splup_004_s: (time: string, alpha: string, bravo: string) => `Das nächste Splatfest beginnt in ${time}! ${alpha} gegen ${bravo}.`,
    a_splup_004_t: (time: string) => `Das nächste Splatfest beginnt in ${time}.`,
    a_splup_004_b: (time: string) => `in ${time}`,
    
    // [Option] Schedule Stage

    o_schedstage_000: 'Fresh! Immer fleißig alles einfärben!',
    o_schedstage_001: 'Ng-yes, auf zu S+50!',
    o_schedstage_002: (time: string) => `Fresh! Dann sehen wir uns in ${time}!`,
    o_schedstage_003: (stage: string) => `Woomy! ${stage} ist eine meiner Lieblings-Arenen!`,

    // [Option] Salmon Run Weapon

    o_srweapon_000: 'Die mag ich auch!',
    o_srweapon_001: (weapon: string) => `${weapon} ist eine gute Wahl.`,
    o_srweapon_002: (weapon: string) => `${weapon}, für einen echten Boss!`,

    // [Option] Merchandise Gear

    o_merch_000: 'Bleib cool!',
    o_merch_001: (time: string) => `Das ist noch für ${time} verfügbar.`,
    o_merch_002: (skill: string) => `Cool, das hat ${skill}`,
    o_merch_003: (merch: string) => `${merch} sieht fresh aus!`
}