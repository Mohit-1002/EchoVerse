"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Lock, Unlock } from "lucide-react"
import { AudioRecorder } from "@/components/audio-recorder"
import { DiaryEntryList } from "@/components/diary-entry-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Update the component to check if database is set up
export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("unlocked")
  const [isRecording, setIsRecording] = useState(false)
  const [isDatabaseReady, setIsDatabaseReady] = useState<boolean | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Try to query the diary_entries table
        const { error } = await supabase.from("diary_entries").select("id").limit(1)

        // If no error, table exists
        if (!error) {
          setIsDatabaseReady(true)
        } else if (error.message.includes("does not exist")) {
          setIsDatabaseReady(false)
        }
      } catch (error) {
        console.error("Error checking database:", error)
        setIsDatabaseReady(false)
      }
    }

    if (user) {
      checkDatabase()
    }
  }, [user, supabase])

  if (loading || !user) {
    return null
  }

  // If database is not ready, show setup button
  if (isDatabaseReady === false) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 container py-6">
          <div className="max-w-md mx-auto mt-10 text-center space-y-6">
            <h1 className="text-3xl font-bold">Welcome to EchoVerse</h1>
            <p className="text-muted-foreground">
              Before you can start recording audio diaries, we need to set up your database.
            </p>
            <Button onClick={() => router.push("/setup")} size="lg">
              Complete Setup
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Audio Diary</h1>
            <p className="text-muted-foreground">Record, encrypt, and discover messages from your past self</p>
          </div>
          <Button onClick={() => setIsRecording(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>

        {isRecording ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Record New Entry</CardTitle>
              <CardDescription>Capture your thoughts and set a future date to unlock this memory</CardDescription>
            </CardHeader>
            <CardContent>
              <AudioRecorder onSave={() => setIsRecording(false)} onCancel={() => setIsRecording(false)} />
            </CardContent>
          </Card>
        ) : null}

        <Tabs defaultValue="unlocked" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="unlocked" className="gap-2">
              <Unlock className="h-4 w-4" />
              Unlocked Entries
            </TabsTrigger>
            <TabsTrigger value="locked" className="gap-2">
              <Lock className="h-4 w-4" />
              Locked Entries
            </TabsTrigger>
          </TabsList>
          <TabsContent value="unlocked" className="space-y-4">
            <DiaryEntryList type="unlocked" />
          </TabsContent>
          <TabsContent value="locked" className="space-y-4">
            <DiaryEntryList type="locked" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
