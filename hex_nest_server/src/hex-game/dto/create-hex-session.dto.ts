export class HexSessionDto {
    readonly session_id: number;
    readonly players_num: number;
    readonly average_rating: number;
    readonly players_id: string[];

    // constructor(session) {
    //     Object.assign(session);
    // }
}

// : Partial<HexSessionDto>