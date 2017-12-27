"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dict = {
    global_error_default: 'Sad woomy. I\'ve been splatted!',
    global_error_missing_param: 'Sad woomy. More info please!',
    api_sched_mode: (id, fallback) => fallback,
    api_sched_rule: (id, fallback) => fallback,
    api_sched_stage: (id, fallback) => fallback,
    api_gear_item: (id, fallback) => fallback,
    api_gear_brand: (id, fallback) => fallback,
    api_gear_skill: (id, fallback) => fallback,
    api_grizz_stage: (id, fallback) => fallback,
    api_grizz_weapon: (id, fallback) => fallback,
    // Schedules Action
    a_sched_000_s: (url) => `I can't help you squiddo. But check out ${url}!`,
    a_sched_000_t: 'I can\'t help you squiddo. But check out this link!',
    a_sched_002_s: (rule, mode, stage1, stage2) => `You can play ${rule} in ${mode} on ${stage1} and ${stage2}.`,
    a_sched_002_t: (rule, mode) => `You can play ${rule} in ${mode} on these maps:`,
    a_sched_003: (mode) => `Active maps for ${mode}`,
    a_sched_004: 'Here you go, all current maps:',
    a_sched_005_start: 'Play',
    a_sched_005_middle: (mode, stage1, stage2) => `${mode} on ${stage1} and ${stage2}`,
    a_sched_005_connector: ' and ',
    a_sched_005_end: '!',
    // All Schedules Action
    a_asched_error_too_much: 'That\'s to much. Chose a specific game mode!',
    a_asched_error_empty_data: 'Meh. The schedule info is not available right now.',
    a_asched_000: (mode) => `Here are the all upcoming stages for ${mode}.`,
    a_asched_001_now: 'now',
    a_asched_001_future: 'in ',
    // ETA for Rule Action
    a_eta_error_incomp_mode_all: 'Well, you can play now if every mode is fine!',
    a_eta_error_incomp_mode_regular: 'Always the same mode in regular. So start splatting now!',
    a_eta_error_unknown_mode: 'Sorry, I don\'t know this mode.',
    a_eta_error_incomp_rule_turf: 'You can play turf war anytime in regular battles.',
    a_eta_error_unknown_rule: 'Sorry, I don\'t know that game type.',
    a_eta_000: 'This type will not be available any time soon.',
    a_eta_001_now: 'right now',
    a_eta_001_future: 'in ',
    a_eta_002_s: (rule, mode, time) => `You can play ${rule} in ${mode} ${time}!`,
    a_eta_002_t: (rule, mode, time) => `You can play ${rule} in ${mode} ${time} on these maps:`,
    // Salmon Run Action
    a_sr_000: 'Sorry, I have no information on upcoming Salmon Run shifts.',
    a_sr_002_s: (stage) => `Mr. Grizz is hiring right now! Get to ${stage} ASAP!`,
    a_sr_002_t: (stage) => `Mr. Grizz ist hiring right now on ${stage}. Take a look a the available weapons:`,
    a_sr_003_s: (stage, eta) => `Salmon Run will be open again in ${eta} on ${stage}.`,
    a_sr_003_t: (stage, eta) => `Salmon Run will be open again in ${eta} on ${stage}. The available weapons will be:`,
    // Merchandise Action
    a_merch_000_s: 'The shop is filled with merch!',
    a_merch_000_t: 'The shop is filled with merch! Take a look:',
    a_merch_001: (skill, brand, eta) => `with ${skill} by ${brand} (${eta} remaining)`
};
//# sourceMappingURL=en.js.map