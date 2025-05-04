"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-provider"
import { DashboardHeader } from "@/components/dashboard-header"
import { DatabaseSetup } from "@/components/database-setup"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SetupPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isDbReady, setIsDbReady] = useState<boolean | null>(null)
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
          setIsDbReady(true)
        } else if (error.message.includes("does not exist")) {
          setIsDbReady(false)
        }
      } catch (error) {
        console.error("Error checking database:", error)
        setIsDbReady(false)
      }
    }

    if (user) {
      checkDatabase()
    }
  }, [user, supabase])

  if (loading || !user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">EchoVerse Setup</h1>

          {isDbReady === true ? (
            <div className="text-center space-y-4">
              <p>Your database is already set up and ready to use!</p>
              <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            </div>
          ) : isDbReady === false ? (
            <DatabaseSetup />
          ) : (
            <div className="text-center">Checking database status...</div>
          )}
        </div>
      </main>
    </div>
  )
}
