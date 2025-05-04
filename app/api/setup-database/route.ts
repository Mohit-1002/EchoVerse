import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create the stored procedure if it doesn't exist
    await supabase.rpc("create_setup_function")

    // Create the diary_entries table
    const { error } = await supabase.rpc("create_diary_entries_table")

    if (error) {
      console.error("Error creating tables:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
