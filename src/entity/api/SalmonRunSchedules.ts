export interface Schedule {
    end_time: number;
    start_time: number;
}

export interface Special {
    image_b: string;
    image_a: string;
    name: string;
    id: string;
}

export interface Sub {
    name: string;
    image_b: string;
    image_a: string;
    id: string;
}

export interface Weapon {
    image: string;
    id: string;
    special: Special;
    sub: Sub;
    name: string;
    thumbnail: string;
}

export interface Stage {
    image: string;
    name: string;
}

export interface Detail {
    start_time: number;
    end_time: number;
    weapons: Weapon[];
    stage: Stage;
}

export interface SalmonRunSchedules {
    schedules: Schedule[];
    details: Detail[];
}