"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Play, Calendar, Clock, Lock, Unlock } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { EmptyState } from "@/components/empty-state"
import { AudioPlayer } from "@/components/audio-player"
import { decryptAudio } from "@/lib/encryption"

interface DiaryEntry {
  id: string
  title: string
  description: string | null
  mood: string | null
  audio_url: string
  encryption_key: string
  created_at: string
  unlock_date: string
  duration: number
  is_played: boolean
}

interface DiaryEntryListProps {
  type: "locked" | "unlocked"
}

export function DiaryEntryList({ type }: DiaryEntryListProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [decryptedAudioUrl, setDecryptedAudioUrl] = useState<string | null>(null)
  const [isDecrypting, setIsDecrypting] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchEntries()
  }, [type])

  const fetchEntries = async () => {
    setLoading(true)

    try {
      const now = new Date().toISOString()

      const query = supabase.from("diary_entries").select("*").order("created_at", { ascending: false })

      if (type === "unlocked") {
        query.lte("unlock_date", now)
      } else {
        query.gt("unlock_date", now)
      }

      const { data, error } = await query

      if (error) {
        // Check if the error is about missing table
        if (error.message.includes("does not exist")) {
          console.log("Database tables not set up yet")
          setEntries([])
        } else {
          throw error
        }
      } else {
        setEntries(data || [])
      }
    } catch (error) {
      console.error("Error fetching entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayEntry = async (entry: DiaryEntry) => {
    if (selectedEntry?.id === entry.id && decryptedAudioUrl) {
      setSelectedEntry(null)
      setDecryptedAudioUrl(null)
      return
    }

    setSelectedEntry(entry)
    setIsDecrypting(true)

    try {
      // Fetch the encrypted audio
      const response = await fetch(entry.audio_url)
      const encryptedBlob = await response.blob()

      // Decrypt the audio
      const decryptedBlob = await decryptAudio(encryptedBlob, entry.encryption_key)
      const url = URL.createObjectURL(decryptedBlob)

      setDecryptedAudioUrl(url)

      // Mark as played if it's the first time
      if (!entry.is_played) {
        await supabase.from("diary_entries").update({ is_played: true }).eq("id", entry.id)

        // Update local state
        setEntries(entries.map((e) => (e.id === entry.id ? { ...e, is_played: true } : e)))
      }
    } catch (error) {
      console.error("Error decrypting audio:", error)
    } finally {
      setIsDecrypting(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={type === "unlocked" ? Unlock : Lock}
        title={type === "unlocked" ? "No unlocked entries yet" : "No locked entries yet"}
        description={
          type === "unlocked"
            ? "When your diary entries unlock, they'll appear here."
            : "Record a new entry and set a future unlock date to see it here."
        }
        action={
          type === "locked" ? (
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Record New Entry
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id} className={selectedEntry?.id === entry.id ? "border-primary" : ""}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{entry.title}</CardTitle>
                <CardDescription>{format(new Date(entry.created_at), "PPP")}</CardDescription>
              </div>
              {entry.mood && (
                <Badge variant="outline" className="capitalize">
                  {entry.mood}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {entry.description && <p className="text-muted-foreground mb-4">{entry.description}</p>}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(entry.duration)}</span>
              </div>

              {type === "locked" ? (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Unlocks {formatDistanceToNow(new Date(entry.unlock_date), { addSuffix: true })}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Unlock className="h-4 w-4" />
                  <span>Unlocked {formatDistanceToNow(new Date(entry.unlock_date), { addSuffix: true })}</span>
                </div>
              )}
            </div>

            {selectedEntry?.id === entry.id && decryptedAudioUrl && (
              <div className="mt-4">
                <AudioPlayer src={decryptedAudioUrl} />
              </div>
            )}
          </CardContent>
          <CardFooter>
            {type === "unlocked" && (
              <Button
                onClick={() => handlePlayEntry(entry)}
                variant={selectedEntry?.id === entry.id ? "default" : "outline"}
                disabled={isDecrypting}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {selectedEntry?.id === entry.id ? "Hide Player" : "Play Entry"}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
