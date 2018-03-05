
export const dict = {
    global_error_default: 'Sad woomy. I\'ve been splatted!',
    global_error_missing_param: 'Sad woomy. More info please!',
    global_reprompt: 'What do you want to know?',

    // [Action] Schedules

    a_sched_000_s: (url: string) => `I can't help you right now. But check out ${url}!`,
    a_sched_000_t: 'I can\'t help you squiddo. But check out this link!',
    a_sched_002_a: (rule: string, mode: string, stage1: string, stage2: string) => `You can play ${rule} in ${mode} on ${stage1} and ${stage2}.`,
    a_sched_002_s: (rule: string, mode: string, stage1: string, stage2: string) => `You can play ${rule} in ${mode} on ${stage1} and ${stage2}. Which do you like more?`,
    a_sched_002_t: (rule: string, mode: string) => `You can play ${rule} in ${mode} on these two maps. Which do you like more?`,
    a_sched_003: (mode: string) => `Active stages for ${mode}`,
    
    a_sched_004: 'Here you go, all current stages. On which one are you going to play?',

    a_sched_005_start: 'Play',
    a_sched_005_middle: (mode: string, stage1: string, stage2: string) => `${mode} on ${stage1} and ${stage2}`,
    a_sched_005_connector: ' and ',
    a_sched_005_end: '! On which one are you going to play?',

    // [Action] All Schedules

    a_asched_error_too_much: 'That\'s to much. Choose a game mode!',
    a_asched_error_empty_data: 'Meh. The schedule info is not available right now.',
    a_asched_000_a: (mode: string, rule1: string, stage1a: string, stage1b: string, rule2: string, time2: string, stage2a: string, stage2b: string) => `Here are the upcoming stages for ${mode}: play ${rule1} right now on ${stage1a} and ${stage1b}. In ${time2} play ${rule2} on ${stage2a} and ${stage2b}.`,
    a_asched_000_s: (mode: string, rule1: string, stage1a: string, stage1b: string, rule2: string, time2: string, stage2a: string, stage2b: string) => `Here are the upcoming stages for ${mode}: play ${rule1} right now on ${stage1a} and ${stage1b}. In ${time2} play ${rule2} on ${stage2a} and ${stage2b}. On which do you want to get splatted?`,
    a_asched_000_t: (mode: string) => `Here are all upcoming stages for ${mode}. On which do you want to get splatted?`,
    a_asched_001_now: 'now',
    a_asched_001_future: 'in ',

    // [Action] ETA for Rule

    a_eta_error_incomp_mode_all: 'Well, you can play now if every mode is fine!',
    a_eta_error_incomp_mode_regular: 'Always the same mode in regular. So start splatting now!',
    a_eta_error_unknown_mode: 'Sorry, I don\'t know this mode.',
    a_eta_error_incomp_rule_turf: 'You can play turf war anytime in regular battles.',
    a_eta_error_unknown_rule: 'Sorry, I don\'t know that game type.',
    a_eta_000: 'This type will not be available any time soon.',
    a_eta_001_now: 'right now',
    a_eta_001_future: 'in ',
    a_eta_002_a: (rule: string, mode: string, time: string, stage1: string, stage2: string) => `You can play ${rule} in ${mode} ${time} on ${stage1} and ${stage2}.`,
    a_eta_002_s: (rule: string, mode: string, time: string, stage1: string, stage2: string) => `You can play ${rule} in ${mode} ${time} on ${stage1} and ${stage2}. Which stage is cooler?`,
    a_eta_002_t: (rule: string, mode: string, time: string) => `You can play ${rule} in ${mode} ${time} on these stages. Which one is cooler?`,
    a_eta_003: 'Stages',

    // [Action] Stage Schedule

    a_ssched_000: (stage: string) => `${stage} doesn't seem to be coming up any time soon.`,
    a_ssched_001_t: (stage: string) => `Here are the next opportunities to play on ${stage}.`,
    a_ssched_002_start: (stage: string) => `The next opportunities to play on the stage ${stage} are:`,
    a_ssched_002_middle: (rule: string, mode: string, time: string) => `${rule} in ${mode} in ${time}`,
    a_ssched_002_middle_now: (rule: string, mode: string) => `${rule} in ${mode} right now`,
    a_ssched_002_connector: ' and ',
    a_ssched_002_end: '. When are you going to play?',
    a_ssched_004: 'now',
    
    // [Action] Salmon Run

    a_sr_000: 'Sorry, I have no information on upcoming Salmon Run shifts.',
    a_sr_002_a: (stage: string, remaining: string, weapon1: string, weapon2: string, weapon3: string, weapon4: string) => `Mr. Grizz is hiring for another ${remaining}! Fight Salmonids on ${stage} with ${weapon1}, ${weapon2}, ${weapon3} or ${weapon4}.`,
    a_sr_002_s: (stage: string, remaining: string, weapon1: string, weapon2: string, weapon3: string, weapon4: string) => `Mr. Grizz is hiring for another ${remaining}! Fight Salmonids on ${stage} with ${weapon1}, ${weapon2}, ${weapon3} or ${weapon4}. Which one can you handle best?`,
    a_sr_002_t: (stage: string, remaining: string) => `Mr. Grizz is hiring for another ${remaining} on ${stage}. Take a look a the available weapons. Which one can you handle best?`,
    a_sr_003_a: (stage: string, eta: string, weapon1: string, weapon2: string, weapon3: string, weapon4: string) => `Salmon Run will be open again in ${eta} on ${stage}. ${weapon1}, ${weapon2}, ${weapon3} and ${weapon4} will be available.`,
    a_sr_003_s: (stage: string, eta: string, weapon1: string, weapon2: string, weapon3: string, weapon4: string) => `Salmon Run will be open again in ${eta} on ${stage}. ${weapon1}, ${weapon2}, ${weapon3} and ${weapon4} will be available. Which one is your favorite?`,
    a_sr_003_t: (stage: string, eta: string) => `Salmon Run will be open again in ${eta} on ${stage}. This will be your weapons. Which one is your favorite?`,
    a_sr_004: 'Unknown',
    a_sr_005_s: (stage: string, remaining: string, weapon: string) => `Mr. Grizz is hiring for another ${remaining}! Fight Salmonids on ${stage}. The available weapon is ${weapon}.`,
    a_sr_005_t: (stage: string, remaining: string) => `Mr. Grizz is hiring for another ${remaining}! Fight Salmonids on ${stage}. Here is the available weapon:`,
    a_sr_006_s: (stage: string, eta: string, weapon: string) => `Salmon Run will be open again in ${eta} on ${stage}. The available weapon will be ${weapon}`,
    a_sr_006_t: (stage: string, eta: string) => `Salmon Run will be open again in ${eta} on ${stage}. This will be your weapon:`,
    a_sr_007: 'Salmon Run',

    // [Action] Merchandise

    a_merch_000_a: (merch1: string, merch2: string, merch3: string) => `${merch1}, ${merch2}, ${merch3} and three other items are available in the shop right now.`,
    a_merch_000_s: (merch1: string, merch2: string, merch3: string) => `${merch1}, ${merch2}, ${merch3} and three other items are available in the shop right now. Like something?`,
    a_merch_000_t: 'These items are available in the shop. Like something?',
    a_merch_001: (skill: string, brand: string, eta: string) => `with ${skill} by ${brand} (${eta} remaining)`,
    a_merch_002: 'Take a look in the app, I can\'t get any info about that right now.',
    a_merch_003: 'Merchandise',
    
    // [Action] Splatfest Result

    a_splres_000: (winner: string, loser: string) => `Team ${winner} won against team ${loser} in the last Splatfest.`,
    a_splres_001: 'They won all three categories',
    a_splres_002: (won1: string, won2: string, lost: string) => `They won ${won1} and ${won2} but lost ${lost}.`,
    a_splres_002_votes: 'the votes',
    a_splres_002_solo: 'solo battles',
    a_splres_002_team: 'team battles',
    a_splres_003: (alpha: string, bravo: string) => `${alpha} vs ${bravo}`,
    a_splres_004: (name: string, alphaRate: number, bravoRate: number) => `**${name}**: ${alphaRate}% - ${bravoRate}%`,
    a_splres_004_votes: 'Votes',
    a_splres_004_solo: 'Solo',
    a_splres_004_team: 'Team',
    a_splres_005: 'Splafest panel',
    a_splres_006: (winner: string) => `Winner: ${winner}`,

    // [Action] Splatfest Upcoming

    a_splup_000: 'I currently don\'t have any infos on upcoming Splatfests in this region.',
    a_splup_001: (alpha: string, bravo: string) => `${alpha} vs ${bravo}`,
    a_splup_002: 'Splafest panel',
    a_splup_003_s: (time: string, alpha: string, bravo: string) => `It\'s Splatfest time! ${alpha} vs ${bravo}. You still got ${time} left!`,
    a_splup_003_t: (time: string) => `It's Splatfest time! Still ${time} left.`,
    a_splup_003_b: (time: string) => `${time} left`,
    a_splup_004_s: (time: string, alpha: string, bravo: string) => `The next Splatfest starts in ${time}! ${alpha} vs ${bravo}.`,
    a_splup_004_t: (time: string) => `The next Splatfest starts in ${time}.`,
    a_splup_004_b: (time: string) => `in ${time}`,

    // [Option] Schedule Stage

    o_schedstage_000: 'Fresh! Keep on inking!',
    o_schedstage_001: 'Ng-yes, let\'s get to S+50!',
    o_schedstage_002: (time: string) => `Fresh! See you in ${time}!`,
    o_schedstage_003: (stage: string) => `Woomy! ${stage} is one of my favorites!`,

    // [Option] Salmon Run Weapon

    o_srweapon_000: 'I like this one too!',
    o_srweapon_001: (weapon: string) => `${weapon} is always a good choice.`,
    o_srweapon_002: (weapon: string) => `${weapon}, for a true profreshional!`,

    // [Option] Merchandise Gear

    o_merch_000: 'Stay fresh!',
    o_merch_001: (time: string) => `This one is still available for about ${time}.`,
    o_merch_002: (skill: string) => `Cool, this one got ${skill}`,
    o_merch_003: (merch: string) => `${merch} looks fresh!`,

    // [Simple] Welcome

    s_welcome_000: 'Hi! I\'m Splat Tim. How can I help?',
    s_welcome_001: 'Woomy! What do you want to know?',
    s_welcome_002: 'Ng-yes! What do you want to know?',

    // [Simple] Cancel

    s_cancel_000: 'Ok.',

    // [Simple] Help

    s_help_000: 'I\'m Splat Tim. You can ask me about the current stages for ranked battles. Or if Mr. Grizz is hiring. What do you want to know?',
    s_help_001: 'I\'m Splat Tim. I can tell you what Merchandise is available on Splatnet. Or the upcoming stages for league battles. What do you want to know?',
    s_help_002: 'I\'m Splat Tim and I\'m here to help. Ask me about current stages for regular battles. Or if Mr. Grizz is hiring. What do you want to know?',

    // [Simple] Age

    s_age_000: 'I answered the first question in January 2018. Is there something you want to know?',
    s_age_001: 'I was publish in January 2018. How can I help you?',

    // [Simple] Hello

    s_hello_000: 'Woomy! How can I help?',
    s_hello_001: 'Hey! Got a question for me?',

    // [Simple] How are you

    s_how_000: 'I\'m great, thanks! Can I help you with something?',
    s_how_001: 'Thanks for asking. Doing well! What do you want to know?',

    // [Simple] Insult

    s_insult_000: 'Don\'t be salty! Can I help you with something?',
    s_insult_001: 'No reason to be salty. Is there something you want to know?',

    // [Simple] Unknown

    s_unknown_000: 'Sorry, can you say that again?',
    s_unknown_001: 'Sorry, I don\'t understand. How can I help?',

    // [Simple] Meme1

    s_meme1_000: 'It Splat Tim!',
    s_meme1_001: 'Woomy!',

    // [Simple] Meme2

    s_meme2_000: 'He does it!',
    s_meme2_001: 'Booyah!'
}