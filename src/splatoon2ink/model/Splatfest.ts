export interface Splatfests {
    na: Region;
    eu: Region;
    jp: Region;
}

export type Result = ResultV1 | ResultV2

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

// Result v1

export interface ResultV1 {
  festival_version: 1;
  summary: SummaryV1;
  festival_id: number;
  rates: RatesV1;
}

export interface SummaryV1 {
  total: number;
  vote: number;
  team: number;
  solo: number;
}

export interface RatesV1 {
  vote: Rate;
  team: Rate;
  solo: Rate;
}

export interface Rate {
  alpha: number;
  bravo: number;
}

export const regionKeyValues = {
  na: 'na',
  eu: 'eu',
  jp: 'jp'
}

// Result v2

export interface ResultV2 {
  festival_version: 2;
  contribution_bravo: Contribution;
  contribution_alpha: Contribution;
  festival_id: number;
  rates: RatesV2;
  summary: SummaryV2;
}

export interface Contribution {
  challenge: number;
  regular: number;
}

export interface SummaryV2 {
  total: number;
  vote: number;
  regular: number;
  challenge: number;
}

export interface RatesV2 {
  challenge: Rate;
  vote: Rate;
  regular: Rate;
}