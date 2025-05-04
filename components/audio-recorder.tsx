"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Mic, Square, Play, Pause, Save, X, Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { encryptAudio } from "@/lib/encryption"

interface AudioRecorderProps {
  onSave: () => void
  onCancel: () => void
}

const moods = [
  { value: "happy", label: "Happy" },
  { value: "reflective", label: "Reflective" },
  { value: "anxious", label: "Anxious" },
  { value: "excited", label: "Excited" },
  { value: "grateful", label: "Grateful" },
  { value: "sad", label: "Sad" },
  { value: "hopeful", label: "Hopeful" },
  { value: "confused", label: "Confused" },
]

export function AudioRecorder({ onSave, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [mood, setMood] = useState("")
  const [unlockDate, setUnlockDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(audioBlob)
        setAudioBlob(audioBlob)
        setAudioUrl(url)

        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setIsPaused(false)

      // Start timer
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSave = async () => {
    if (!audioBlob) {
      toast({
        title: "No Recording",
        description: "Please record an audio entry before saving.",
        variant: "destructive",
      })
      return
    }

    if (!title) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your entry.",
        variant: "destructive",
      })
      return
    }

    if (!unlockDate) {
      toast({
        title: "Unlock Date Required",
        description: "Please select a future date when this entry will be unlocked.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
console.log("Starting to save diary entry...")

  try {
    // ✅ 1. Get the user first
    console.log("Fetching user from Supabase...")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("User fetch error:", userError)
      throw new Error("User not authenticated")
    }

    console.log("Authenticated user:", user.id)

    // ✅ 2. Encrypt the audio
    console.log("Encrypting audio...")
    const { encryptedData, encryptionKey } = await encryptAudio(audioBlob)
    console.log("Encryption complete. Encryption key:", encryptionKey)

    // ✅ 3. Upload encrypted audio to Supabase Storage
    const fileName = `${Date.now()}-encrypted.webm`
    console.log(`Uploading file to Supabase: ${fileName}`)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio-diaries")
      .upload(fileName, encryptedData, {
        contentType: "application/octet-stream",
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      throw uploadError
    }

    console.log("Upload successful:", uploadData)

    // ✅ 4. Get the signed URL for playback access
    console.log("Creating signed URL...")
    const { data: urlData } = await supabase.storage
      .from("audio-diaries")
      .createSignedUrl(fileName, 31536000)

    if (!urlData?.signedUrl) {
      console.error("Failed to create signed URL")
      throw new Error("Failed to get signed URL")
    }

    console.log("Signed URL created:", urlData.signedUrl)

    // ✅ 5. Save entry metadata to database
    console.log("Inserting entry into database...")
    const { error: insertError } = await supabase.from("diary_entries").insert({
      user_id: user.id,
      title,
      description,
      mood,
      audio_url: urlData.signedUrl,
      encryption_key: encryptionKey,
      unlock_date: unlockDate.toISOString(),
      duration: recordingTime,
    })

    if (insertError) {
      console.error("Database insert error:", insertError)
      throw insertError
    }

    console.log("Diary entry saved successfully!")

    toast({
      title: "Entry Saved",
      description: `Your audio diary will be unlocked on ${format(unlockDate, "PPP")}.`,
    })

    onSave()
  } catch (error) {
    console.error("Error saving entry:", error)
    toast({
      title: "Save Failed",
      description: "There was a problem saving your entry. Please try again.",
      variant: "destructive",
    })
  } finally {
    console.log("Resetting submit state.")
    setIsSubmitting(false)
  }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted/50">
        <div className="text-4xl font-mono mb-4">{formatTime(recordingTime)}</div>
        <div className="flex gap-4">
          {!isRecording && !audioUrl ? (
            <Button
              onClick={startRecording}
              size="lg"
              className="rounded-full h-16 w-16 flex items-center justify-center"
            >
              <Mic className="h-6 w-6" />
            </Button>
          ) : isRecording ? (
            <>
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="rounded-full h-16 w-16 flex items-center justify-center"
              >
                <Square className="h-6 w-6" />
              </Button>
              {isPaused ? (
                <Button
                  onClick={resumeRecording}
                  size="lg"
                  variant="outline"
                  className="rounded-full h-16 w-16 flex items-center justify-center"
                >
                  <Play className="h-6 w-6" />
                </Button>
              ) : (
                <Button
                  onClick={pauseRecording}
                  size="lg"
                  variant="outline"
                  className="rounded-full h-16 w-16 flex items-center justify-center"
                >
                  <Pause className="h-6 w-6" />
                </Button>
              )}
            </>
          ) : null}
        </div>

        {audioUrl && (
          <div className="mt-4 w-full">
            <audio ref={audioRef} src={audioUrl} controls className="w-full" />
            <div className="flex justify-center mt-4">
              <Button onClick={startRecording} variant="outline" className="gap-2">
                <Mic className="h-4 w-4" />
                Record Again
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your entry a title"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some context to your future self"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="mood">Mood</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger id="mood">
                <SelectValue placeholder="How are you feeling?" />
              </SelectTrigger>
              <SelectContent>
                {moods.map((mood) => (
                  <SelectItem key={mood.value} value={mood.value}>
                    {mood.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unlock-date">Unlock Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="unlock-date"
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !unlockDate && "text-muted-foreground")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {unlockDate ? format(unlockDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={unlockDate}
                  onSelect={setUnlockDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!audioBlob || !title || !unlockDate || isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Entry"}
        </Button>
      </div>
    </div>
  )
}
