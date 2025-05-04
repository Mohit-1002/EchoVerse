"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Database, Check } from "lucide-react"

export function DatabaseSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const setupDatabase = async () => {
    setIsLoading(true)

    try {
      // Create the diary_entries table
      const { error: tableError } = await supabase.rpc("create_diary_entries_table")

      if (tableError) {
        throw tableError
      }

      // Create the storage bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage.createBucket("audio-diaries", {
        public: false,
        fileSizeLimit: 50000000, // 50MB
      })

      // Ignore error if bucket already exists
      if (bucketError && !bucketError.message.includes("already exists")) {
        throw bucketError
      }

      toast({
        title: "Database setup complete",
        description: "Your EchoVerse database is ready to use.",
      })

      setIsComplete(true)
    } catch (error: any) {
      console.error("Database setup error:", error)
      toast({
        title: "Setup failed",
        description: error.message || "There was a problem setting up the database.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Setup</CardTitle>
        <CardDescription>
          Set up the necessary database tables and storage for your EchoVerse audio diary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Before you can start recording audio diaries, we need to set up your database. This only needs to be done
          once.
        </p>
      </CardContent>
      <CardFooter>
        {isComplete ? (
          <Button disabled className="gap-2 w-full">
            <Check className="h-4 w-4" />
            Setup Complete
          </Button>
        ) : (
          <Button onClick={setupDatabase} disabled={isLoading} className="gap-2 w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            {isLoading ? "Setting Up..." : "Initialize Database"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
