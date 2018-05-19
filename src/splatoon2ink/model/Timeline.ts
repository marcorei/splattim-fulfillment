// Coop Gear

export interface Brand {
    name: string;
    image: string;
    id: string;
}

export interface Gear {
    image: string;
    id: string;
    kind: string;
    rarity: number;
    thumbnail: string;
    brand: Brand;
    name: string;
}

export interface RewardGear {
    available_time: number;
    gear: Gear;
}

export interface Coop {
    reward_gear: RewardGear;
    importance: number;
}

// Weapon Availability

export interface Weapon {
    id: number // ??
    name: string
    image: string
    special: {
        id: number // ??
        image_a: string        
    },
    sub: {
        id: number // ??
        image_a: string
    }
}

export interface WeaponAvailability {
    release_time: number
    weapon: Weapon
}

export interface WeaponAvailabilities {
    availabilities: WeaponAvailability[]
}

// Root

export interface Timeline {
    coop: Coop;
    weapon_availability?: WeaponAvailabilities;
}

