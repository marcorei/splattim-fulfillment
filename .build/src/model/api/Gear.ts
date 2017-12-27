export interface Skill {
    id: string;
    name: string;
    image: string;
}

export interface Brand {
    id: string;
    frequent_skill: Skill;
    name: string;
    image: string;
}

export interface Gear {
    rarity: number;
    image: string;
    thumbnail: string;
    id: string;
    brand: Brand;
    kind: string;
    name: string;
}

export interface OriginalGear {
    name: string;
    price: number;
    rarity: number;
    skill: Skill;
}

export interface Merchandise {
    id: string;
    kind: string;
    skill: Skill;
    end_time: number;
    price: number;
    gear: Gear;
    original_gear: OriginalGear;
}

export interface Inventory {
    merchandises: Merchandise[];
}