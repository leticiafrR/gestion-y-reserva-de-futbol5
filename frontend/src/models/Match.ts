export type MatchStatus = "open" | "confirmed" | "finished" | "full" | "cancelled"
export type MatchType = "open" | "closed"

export interface Player {
    id: number
    password: string
    role: string
    username: string
    gender: string
    birthYear: number
    zone: string
    name: string
    last_name: string
    email: string
    emailVerified: boolean
    active: boolean
    profilePicture: string
    authorities: Array<{ authority: string }>
    enabled: boolean
    accountNonExpired: boolean
    accountNonLocked: boolean
    credentialsNonExpired: boolean
}

export interface Field {
    id: number
    name: string
    grassType: string
    lighting: boolean
    zone: string
    address: string
    photoUrl: string
    price: number
    active: boolean
    owner: Player
}

export interface TimeSlot {
    id: number
    dayOfWeek: string
    openTime: number
    closeTime: number
    field: Field
}

export interface Booking {
    id: number
    user: Player
    timeSlot: TimeSlot
    bookingDate: string
    bookingHour: number
    active: boolean
    createdAt: string
}

export interface MatchCard {
    id: string
    type: MatchType
    title: string
    date: string
    time: string
    field: Field
    organizer: Organizer
    minPlayers: number
    maxPlayers: number
    currentPlayers: number
    pricePerPlayer: number
    status: MatchStatus
    isParticipant: boolean
    isOrganizer: boolean
    players: Player[]
    teams: Teams | null
    description: string
    createdAt: string
    result?: string
}

export interface Match {
    id: number
    booking: Booking
    isActive: boolean
    players: Player[]
    minPlayers: number
    maxPlayers: number
    teamOne: any | null
    teamTwo: any | null
    matchType?: "open" | "closed"
}

export interface Organizer {
    id: string
    name: string
    avatar: string
}

export interface Teams {
    team1: Player[]
    team2: Player[]
}

export interface CreateOpenMatchData {
    bookingId: number
    maxPlayers: number
    minPlayers: number
}

export interface CreateClosedMatchData {
    bookingId: number
    teamOneId: number
    teamTwoId: number
}

export interface OpenMatchResponse {
    id: number
    booking: {
        id: number
        userId: number
        timeSlotId: number
        bookingDate: string
        bookingHour: number
        active: boolean
    }
    isActive: boolean
    players: Array<{
        id: number
        name: string
        last_name: string
        email: string
        profilePicture: string
    }>
    minPlayers: number
    maxPlayers: number
    teamOne: any | null
    teamTwo: any | null
}

export interface CloseMatchResponse {
    id: number
    booking: {
        id: number
        userId: number
        timeSlotId: number
        bookingDate: string
        bookingHour: number
        active: boolean
    }
    isActive: boolean
    teamOne: any
    teamTwo: any
}

export interface AvailableSlot {
    id: number
    date: string
    startTime: string
    endTime: string
    field: Field
    pricePerHour: number
    isAvailable: boolean
}
  