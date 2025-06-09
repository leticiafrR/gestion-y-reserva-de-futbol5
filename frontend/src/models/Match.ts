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
    type: "open" | "closed"
    title: string
    date: string
    time: string
    field: Field
    organizer: Organizer
    minPlayers: number
    maxPlayers: number
    currentPlayers: number
    pricePerPlayer: number
    status: "open" | "confirmed" | "finished" | "full" | "cancelled"
    isParticipant: boolean
    isOrganizer: boolean
    players: Player[]
    teams: Teams | null
    description: string
    createdAt: string
    result?: string
  }
  
  export interface CreateMatchData {
    type: "open" | "closed"
    title: string
    date: string
    time: string
    field: Field
    minPlayers: number
    maxPlayers: number
    pricePerPlayer: number
    description?: string
    selectedTeams?: {
      team1: string
      team2: string
    }
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
  