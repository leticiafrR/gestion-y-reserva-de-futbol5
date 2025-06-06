"use client"

import { useState, useEffect } from "react"
import type { Match, CreateMatchData } from "../models/Match"

// Mock data para desarrollo
const mockAvailableMatches: Match[] = [
  {
    id: "1",
    type: "open",
    title: "Partido Abierto - Fútbol 11",
    date: "2024-01-15",
    time: "18:00 - 20:00",
    field: {
      id: "1",
      name: "Cancha Principal",
      location: "Zona Norte",
      surface: "Césped natural",
    },
    organizer: {
      id: "1",
      name: "Carlos Mendoza",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    minPlayers: 10,
    maxPlayers: 22,
    currentPlayers: 8,
    pricePerPlayer: 15000,
    status: "open",
    isParticipant: false,
    isOrganizer: false,
    players: [
      { id: "1", name: "Juan Pérez", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "2", name: "María García", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "3", name: "Pedro López", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "4", name: "Ana Martín", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "5", name: "Luis Rodríguez", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "6", name: "Carmen Silva", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "7", name: "Diego Torres", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "8", name: "Laura Vega", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    teams: null,
    description: "Partido amistoso para todos los niveles. ¡Ven a divertirte!",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    type: "open",
    title: "Fútbol 7 - Tarde",
    date: "2024-01-16",
    time: "16:00 - 17:30",
    field: {
      id: "2",
      name: "Cancha Sintética 1",
      location: "Zona Sur",
      surface: "Césped sintético",
    },
    organizer: {
      id: "2",
      name: "Andrea Ruiz",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    minPlayers: 8,
    maxPlayers: 14,
    currentPlayers: 9,
    pricePerPlayer: 12000,
    status: "open",
    isParticipant: false,
    isOrganizer: false,
    players: [],
    teams: null,
    description: "Partido rápido de fútbol 7.",
    createdAt: "2024-01-08T14:00:00Z",
  },
]

const mockMyMatches: Match[] = [
  {
    id: "my-1",
    type: "open",
    title: "Mi Partido Organizado",
    date: "2024-01-18",
    time: "20:00 - 22:00",
    field: {
      id: "4",
      name: "Cancha Nocturna",
      location: "Zona Este",
      surface: "Césped sintético",
    },
    organizer: {
      id: "current-user",
      name: "Yo",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    minPlayers: 12,
    maxPlayers: 20,
    currentPlayers: 14, // Ya tiene el mínimo para asignar equipos
    pricePerPlayer: 18000,
    status: "confirmed",
    isParticipant: true,
    isOrganizer: true,
    players: [
      { id: "1", name: "Juan Pérez", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "2", name: "María García", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "3", name: "Pedro López", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "4", name: "Ana Martín", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "5", name: "Luis Rodríguez", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "6", name: "Carmen Silva", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "7", name: "Diego Torres", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "8", name: "Laura Vega", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "9", name: "Roberto Díaz", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "10", name: "Sofia Castro", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "11", name: "Miguel Herrera", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "12", name: "Elena Morales", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "13", name: "Carlos Vega", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "14", name: "Lucia Fernandez", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    teams: null,
    description: "Partido que organicé para el fin de semana.",
    createdAt: "2024-01-12T16:00:00Z",
  },
  {
    id: "my-2",
    type: "open",
    title: "Partido Amistoso",
    date: "2024-01-20",
    time: "15:00 - 17:00",
    field: {
      id: "1",
      name: "Cancha Principal",
      location: "Zona Norte",
      surface: "Césped natural",
    },
    organizer: {
      id: "3",
      name: "Roberto Silva",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    minPlayers: 10,
    maxPlayers: 22,
    currentPlayers: 16,
    pricePerPlayer: 15000,
    status: "confirmed",
    isParticipant: true,
    isOrganizer: false,
    players: [],
    teams: null,
    description: "Partido al que me uní.",
    createdAt: "2024-01-13T11:00:00Z",
  },
]

const mockMatchHistory: Match[] = [
  {
    id: "hist-1",
    type: "open",
    title: "Partido de Verano",
    date: "2024-01-05",
    time: "18:00 - 20:00",
    field: {
      id: "2",
      name: "Cancha Sintética 1",
      location: "Zona Sur",
      surface: "Césped sintético",
    },
    organizer: {
      id: "4",
      name: "Fernando López",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    minPlayers: 10,
    maxPlayers: 20,
    currentPlayers: 18,
    pricePerPlayer: 12000,
    status: "finished",
    isParticipant: true,
    isOrganizer: false,
    result: "Equipo A 3 - 2 Equipo B",
    players: [],
    teams: {
      team1: [
        { id: "1", name: "Juan Pérez", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "2", name: "María García", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "3", name: "Pedro López", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "4", name: "Ana Martín", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "5", name: "Luis Rodríguez", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "6", name: "Carmen Silva", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "7", name: "Diego Torres", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "8", name: "Laura Vega", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "9", name: "Yo", avatar: "/placeholder.svg?height=32&width=32" },
      ],
      team2: [
        { id: "10", name: "Roberto Díaz", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "11", name: "Sofia Castro", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "12", name: "Miguel Herrera", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "13", name: "Elena Morales", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "14", name: "Carlos Vega", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "15", name: "Lucia Fernandez", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "16", name: "Pablo Ruiz", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "17", name: "Andrea Soto", avatar: "/placeholder.svg?height=32&width=32" },
        { id: "18", name: "Mateo Cruz", avatar: "/placeholder.svg?height=32&width=32" },
      ],
    },
    description: "Gran partido de verano con buen nivel.",
    createdAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "hist-2",
    type: "closed",
    title: "Liga Empresarial - Semifinal",
    date: "2023-12-20",
    time: "19:00 - 21:00",
    field: {
      id: "3",
      name: "Cancha Premium",
      location: "Centro",
      surface: "Césped natural",
    },
    organizer: {
      id: "5",
      name: "Liga Empresarial",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    minPlayers: 22,
    maxPlayers: 22,
    currentPlayers: 22,
    pricePerPlayer: 0,
    status: "finished",
    isParticipant: true,
    isOrganizer: false,
    result: "Tech Solutions 1 - 0 Marketing Pro",
    players: [],
    teams: {
      team1: [], // Tech Solutions
      team2: [], // Marketing Pro
    },
    description: "Semifinal del torneo empresarial.",
    createdAt: "2023-12-15T09:00:00Z",
  },
]

export const useAvailableMatches = () => {
  const [data, setData] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos - Solo partidos abiertos que puedo unirme
    setTimeout(() => {
      const availableOpenMatches = mockAvailableMatches.filter(
        (match) => match.type === "open" && match.status === "open" && match.currentPlayers < match.maxPlayers,
      )
      setData(availableOpenMatches)
      setIsLoading(false)
    }, 1000)
  }, [])

  return { data, isLoading }
}

export const useMyMatches = () => {
  const [data, setData] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setData(mockMyMatches)
      setIsLoading(false)
    }, 800)
  }, [])

  return { data, isLoading }
}

export const useMatchHistory = () => {
  const [data, setData] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setData(mockMatchHistory)
      setIsLoading(false)
    }, 800)
  }, [])

  return { data, isLoading }
}

export const useJoinMatch = () => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (matchId: string) => {
    setIsPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Aquí iría la lógica real de unirse al partido
      console.log("Joined match:", matchId)
      return true
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export const useLeaveMatch = () => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (matchId: string) => {
    setIsPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Aquí iría la lógica real de salir del partido
      console.log("Left match:", matchId)
      return true
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export const useCreateMatch = () => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (matchData: CreateMatchData) => {
    setIsPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // Aquí iría la lógica real de crear partido
      console.log("Created match:", matchData)
      return true
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export const useConfirmMatch = () => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (matchId: string) => {
    setIsPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Confirmed match:", matchId)
      return true
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export const useAssignTeams = () => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (matchId: string, teams: { team1: any[]; team2: any[] }) => {
    setIsPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Assigned teams for match:", matchId, teams)
      return true
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

// Añadir la función createMatch como exportación nombrada al final del archivo

export const createMatch = async (matchData: CreateMatchData): Promise<Match> => {
  // Simular creación de partido
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMatch: Match = {
        id: Date.now().toString(),
        type: matchData.type,
        title: matchData.title,
        date: matchData.date,
        time: matchData.time,
        field: matchData.field,
        organizer: {
          id: "current-user",
          name: "Usuario Actual",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        minPlayers: matchData.minPlayers,
        maxPlayers: matchData.maxPlayers,
        currentPlayers: 1,
        pricePerPlayer: matchData.pricePerPlayer,
        status: "open",
        isParticipant: true,
        isOrganizer: true,
        players: [],
        teams: matchData.type === "closed" ? { team1: [], team2: [] } : null,
        description: matchData.description || "",
        createdAt: new Date().toISOString(),
      }
      resolve(newMatch)
    }, 1500)
  })
}
