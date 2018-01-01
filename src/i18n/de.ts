import { dict as index } from './en'
import * as sched from '../entity/api/Schedules'
import * as gear from '../entity/api/Gear'
import * as coop from '../entity/api/SalmonRunSchedules'

export const dict: typeof index = {
    global_error_default: 'Trauriges woomy. Ich wurde gesplattet!',
    global_error_missing_param: 'Trauriges woomy. Ich brauche mehr Infos!',

    api_sched_mode: (i: sched.GameMode): string => i.name,
    api_sched_rule: (i: sched.Rule): string => i.name,
    api_sched_stage: (i: sched.Stage): string => i.name,
    api_gear_item: (i: gear.Gear): string => i.name,
    api_gear_brand: (i: gear.Brand): string => i.name,
    api_gear_skill: (i: gear.Skill): string => i.name,
    api_grizz_stage: (i: coop.Stage): string => i.name,
    api_grizz_weapon: (i: coop.Weapon): string => i.name,

    // Schedules Action

    a_sched_000_s: (url: string) => `Ich kann Dir nicht helfen, Inkling. Aber schau mal auf ${url}!`,
    a_sched_000_t: 'Ich kann Die nicht helfen, Inkling. Aber schau mal auf dieser Website nach!',
    a_sched_002_s: (rule: string, mode: string, stage1: string, stage2: string) => `Du kannst ${rule} im ${mode} in den Arenen ${stage1} und ${stage2} spielen.`,
    a_sched_002_t: (rule: string, mode: string) => `Du kannst ${rule} im ${mode} auf diesen Arenen spielen:`,
    a_sched_003: (mode: string) => `Aktuelle Arenen für ${mode}`,
    
    a_sched_004: 'Hier schau, alle aktuellen Arenen:',

    a_sched_005_start: 'Spiele',
    a_sched_005_middle: (mode: string, stage1: string, stage2: string) => `${mode} in den Arenen ${stage1} und ${stage2}`,
    a_sched_005_connector: ' und ',
    a_sched_005_end: '!',

    // All Schedules Action

    a_asched_error_too_much: 'Zuviel Info. Such Dir einen Spiel-Modus aus!',
    a_asched_error_empty_data: 'Hm. Die Infos sind gerade nicht verfügbar.',
    a_asched_000: (mode: string) => `Hier sind alle anstehenden Arenen für ${mode}.`,
    a_asched_001_now: 'jetzt',
    a_asched_001_future: 'in ',

    // ETA for Rule Action

    a_eta_error_incomp_mode_all: 'Wenn dir der Spiel-Modus egal ist, dann kannst du gleich anfangen zu spielen!',
    a_eta_error_incomp_mode_regular: 'Im Standardkampf ist immer der gleiche Spiel-Typ!',
    a_eta_error_unknown_mode: 'Hm, diesen Modus kenne ich nicht.',
    a_eta_error_incomp_rule_turf: 'Im Standardkampf kannst du jederzeit Revierkämpfe spielen.',
    a_eta_error_unknown_rule: 'Diesen Spiel-Typ kenne ich nicht.',
    a_eta_000: 'Dieser Spiel-Typ wird erstmal nicht zur Verfügung stehen.',
    a_eta_001_now: 'jetzt',
    a_eta_001_future: 'in ',
    a_eta_002_s: (rule: string, mode: string, time: string) => `Du kannst ${rule} im ${mode} ${time} spielen!`,
    a_eta_002_t: (rule: string, mode: string, time: string) => `Du kannst ${rule} im ${mode} ${time} in diesen Arenen spielen:`,

    // Salmon Run Action

    a_sr_000: 'Sorry, ich habe keine Infos zu kommenden Salmon Run Zeiten.',
    a_sr_002_s: (stage: string) => `Herr Bär stellt aktuell ein! Auf zu ${stage}!`,
    a_sr_002_t: (stage: string) => `Herr Bär stellt aktuell ein, auf ${stage}. Hier sind die verfügbaren Waffen:`,
    a_sr_003_s: (stage: string, eta: string) => `Salmon Run wird in ${eta} wieder auf der Map ${stage} offen sein.`,
    a_sr_003_t: (stage: string, eta: string) => `Salmon Run wird in ${eta} wieder auf der Map ${stage} offen sein. Das werden die Waffen sein:`,

    // Merchandise Action

    a_merch_000_s: 'Reichlich Auswahl im Shop!',
    a_merch_000_t: 'Reichlich Auswahl im Shop! Hier, schau:',
    a_merch_001: (skill: string, brand: string, eta: string) => `with ${skill} by ${brand} (${eta} remaining)`
    
}