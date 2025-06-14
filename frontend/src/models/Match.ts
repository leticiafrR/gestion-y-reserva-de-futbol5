export type MatchStatus = "open" | "confirmed" | "finished" | "full" | "cancelled"
export type MatchType = "open" | "closed"

export interface Player {
    id: string
    name: string
    avatar: string
    age?: number
    rating?: number
    position?: string
  }
  
  export interface Field {
    id: string
    name: string
    location: string
    surface: string
    pricePerHour?: number
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
  
  export interface Match {
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
  
  export interface CreateOpenMatchData {
    bookingId: number
    creatorId: number
    maxPlayers: number
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
    id: string
    date: string
    startTime: string
    endTime: string
    field: Field
    pricePerHour: number
    isAvailable: boolean
  }
  