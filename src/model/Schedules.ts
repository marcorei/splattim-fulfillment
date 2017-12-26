export interface Stage {
    image: string;
    id: string;
    name: string;
}

export interface Rule {
    key: string;
    name: string;
    multiline_name: string;
}

export interface GameMode {
    key: string;
    name: string;
}

export interface Schedule {
    rule: Rule;
    start_time: number;
    stage_a: Stage;
    id: number;
    end_time: number;
    stage_b: Stage;
    game_mode: GameMode;
}

export interface Schedules {
    regular: [Schedule],
    league: [Schedule],
    gachi: [Schedule] 
}