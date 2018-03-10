export interface Splatfests {
    na: Region;
    eu: Region;
    jp: Region;
}

export interface Region {
    festivals: Festival[];
    results: Result[];
}

// Festival

export interface Festival {
    colors: Colors;
    names: Names;
    images: Images;
    times: Times;
    special_stage: SpecialStage;
    festival_id: number;
}

export interface Colors {
    alpha: Color;
    bravo: Color;
    middle: Color;
}

export interface Color {
    css_rgb: string;
    b: number;
    g: number;
    a: number;
    r: number;
}

export interface Names {
  bravo_short: string;
  alpha_short: string;
  alpha_long: string;
  bravo_long: string;
}

export interface Images {
  bravo: string;
  panel: string;
  alpha: string;
}

export interface Times {
  announce: number;
  result: number;
  end: number;
  start: number;
}

export interface SpecialStage {
  id: string;
  image: string;
  name: string;
}

// Result

export interface Result {
  num_participants: number;
  summary: Summary;
  team_scores: TeamScores;
  festival_id: number;
  rates: Rates;
  team_participants: TeamParticipants;
}

export interface Summary {
  total: number;
  vote: number;
  team: number;
  solo: number;
}

export interface TeamScores {
  alpha_solo: number;
  alpha_team: number;
  bravo_solo: number;
  bravo_team: number;
}

export interface Rates {
  vote: Rate;
  team: Rate;
  solo: Rate;
}

export interface Rate {
  alpha: number;
  bravo: number;
}

export interface TeamParticipants {
  alpha: number;
  bravo: number;
}

export const regionKeyValues = {
  na: 'na',
  eu: 'eu',
  jp: 'jp'
}