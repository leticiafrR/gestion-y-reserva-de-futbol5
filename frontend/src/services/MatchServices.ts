"use client"

import { useState, useEffect } from "react"
import type { 
  Match, 
  MatchStatus, 
  MatchType, 
  CreateOpenMatchData,
  CreateClosedMatchData,
  OpenMatchResponse,
  CloseMatchResponse
} from "../models/Match"
import { BASE_API_URL, getAuthToken } from "@/config/app-query-client"
import { useQuery } from "@tanstack/react-query"

const fetchAvailableMatches = async () => {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/matches/open`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const matches = await response.json();
  const userProfile = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userProfile") || '{}') : {};
  // Filtrar partidos donde el usuario NO participa
  const filtered = matches.filter((match: any) => {
    // Abierto
    if (Array.isArray(match.players)) {
      return !match.players.some((player: any) =>
        player.id === userProfile.id || player.username === userProfile.email
      );
    }
    // Cerrado
    if (match.teamOne && Array.isArray(match.teamOne.members)) {
      if (match.teamOne.members.some((player: any) =>
        player.id === userProfile.id || player.username === userProfile.email
      )) return false;
    }
    if (match.teamTwo && Array.isArray(match.teamTwo.members)) {
      if (match.teamTwo.members.some((player: any) =>
        player.id === userProfile.id || player.username === userProfile.email
      )) return false;
    }
    return true;
  });
  
  // Agregar el tipo de partido
  return filtered.map((match: any) => ({
    ...match,
    matchType: "open"
  }));
};

export const useAvailableMatches = () =>
  useQuery({
    queryKey: ["availableMatches"],
    queryFn: fetchAvailableMatches,
  });

const fetchMyMatches = async () => {
  const accessToken = getAuthToken();
  const [openMatchesResponse, closedMatchesResponse] = await Promise.all([
    fetch(`${BASE_API_URL}/matches/open`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }),
    fetch(`${BASE_API_URL}/matches/close`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
  ]);

  if (!openMatchesResponse.ok || !closedMatchesResponse.ok) {
    const openError = await openMatchesResponse.text();
    const closedError = await closedMatchesResponse.text();
    throw new Error(`Server error: Open matches: ${openError}, Closed matches: ${closedError}`);
  }

  const openMatches = await openMatchesResponse.json();
  const closedMatches = await closedMatchesResponse.json();
  const userProfile = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userProfile") || '{}') : {};

  // Filtrar partidos donde el usuario participa
  const filteredOpen = openMatches.filter((match: any) => {
    if (Array.isArray(match.players)) {
      return match.players.some((player: any) =>
        player.id === userProfile.id || player.username === userProfile.email
      );
    }
    return false;
  });

  const filteredClosed = closedMatches.filter((match: any) => {
    // Participa en alguno de los equipos
    if (match.teamOne && Array.isArray(match.teamOne.members)) {
      if (match.teamOne.members.some((player: any) =>
        player.id === userProfile.id || player.username === userProfile.email
      )) return true;
    }
    if (match.teamTwo && Array.isArray(match.teamTwo.members)) {
      if (match.teamTwo.members.some((player: any) =>
        player.id === userProfile.id || player.username === userProfile.email
      )) return true;
    }
    return false;
  });

  // Agregar el tipo de partido
  const openWithType = filteredOpen.map((match: any) => ({
    ...match,
    matchType: "open"
  }));
  
  const closedWithType = filteredClosed.map((match: any) => ({
    ...match,
    matchType: "closed"
  }));

  return [...openWithType, ...closedWithType];
};

export const useMyMatches = () =>
  useQuery({
    queryKey: ["myMatches"],
    queryFn: fetchMyMatches,
  });

export const useJoinMatch = () => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (matchId: string, userId: number) => {
    setIsPending(true)
    try {
      const accessToken = getAuthToken()
      const response = await fetch(`${BASE_API_URL}/matches/open/${matchId}/join?userId=${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error('Failed to join match')
      }
      return response.json()
    } catch (error) {
      console.error('Error joining match:', error)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export const useCreateMatch = () => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (matchData: CreateOpenMatchData) => {
    setIsPending(true)
    try {
      const accessToken = getAuthToken()
      const response = await fetch(`${BASE_API_URL}/matches/open`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(matchData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create match')
      }
      
      return response.json()
    } catch (error) {
      console.error('Error creating match:', error)
      throw error
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
      const accessToken = getAuthToken()
      const assignments = teams.team1.reduce((acc, player) => {
        acc[player.id] = 1
        return acc
      }, {} as Record<string, number>)
      
      teams.team2.forEach(player => {
        assignments[player.id] = 2
      })

      const response = await fetch(`${BASE_API_URL}/matches/${matchId}/assign/manual`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignments)
      })
      if (!response.ok) {
        throw new Error('Failed to assign teams')
      }
      return response.json()
    } catch (error) {
      console.error('Error assigning teams:', error)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export const useAssignRandomTeams = () => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (matchId: string) => {
    setIsPending(true)
    try {
      const accessToken = getAuthToken()
      const response = await fetch(`${BASE_API_URL}/matches/${matchId}/assign/random`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error('Failed to assign random teams')
      }
      return response.json()
    } catch (error) {
      console.error('Error assigning random teams:', error)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export const useAssignTeamsByAge = () => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (matchId: string) => {
    setIsPending(true)
    try {
      const accessToken = getAuthToken()
      const response = await fetch(`${BASE_API_URL}/matches/${matchId}/assign/age`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error('Failed to assign teams by age')
      }
      return response.json()
    } catch (error) {
      console.error('Error assigning teams by age:', error)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export const useLeaveMatch = () => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (matchId: string, userId: number) => {
    setIsPending(true)
    try {
      const accessToken = getAuthToken()
      const response = await fetch(`${BASE_API_URL}/matches/open/${matchId}/leave?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error('Failed to leave match')
      }
      return response.json()
    } catch (error) {
      console.error('Error leaving match:', error)
      throw error
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
      const accessToken = getAuthToken()
      const response = await fetch(`${BASE_API_URL}/matches/open/${matchId}/confirm`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error('Failed to confirm match')
      }
      return response.json()
    } catch (error) {
      console.error('Error confirming match:', error)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export const useMatchHistory = () => {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const accessToken = getAuthToken()
        const response = await fetch(`${BASE_API_URL}/matches/close`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Server error: ${errorText}`)
        }

        const matches = await response.json()
        setData(matches)
      } catch (error) {
        console.error('Error fetching match history:', error)
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatches()
  }, [])

  return { data, isLoading }
}

export const createOpenMatch = async (matchData: CreateOpenMatchData) => {
  const accessToken = getAuthToken()
  const response = await fetch(`${BASE_API_URL}/matches/open`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(matchData)
  })

  if (!response.ok) {
    throw new Error('Failed to create match')
  }

  return response.json()
}

export const createClosedMatch = async (matchData: CreateClosedMatchData) => {
  const accessToken = getAuthToken()
  const response = await fetch(`${BASE_API_URL}/matches/close`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(matchData)
  })

  if (!response.ok) {
    throw new Error('Failed to create closed match')
  }

  return response.json()
}

export const useUserProfile = () => {
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = getAuthToken();
        const response = await fetch(`${BASE_API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });
        if (!response.ok) return;
        const profile = await response.json();
        localStorage.setItem("userProfile", JSON.stringify(profile));
      } catch (e) {
        // ignore
      }
    };
    fetchProfile();
  }, []);
};
