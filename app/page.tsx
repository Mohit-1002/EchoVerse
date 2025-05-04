import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mic, Calendar, Lock, Unlock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold">EchoVerse</h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Messages to Your Future Self
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Record your thoughts, hopes, and memories today. Unlock them when you need them most.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto">
                      Start Your Journey
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
                  <div className="absolute -bottom-8 right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
                  <div className="absolute -bottom-8 -left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>
                  <div className="relative bg-white dark:bg-gray-900 border rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mic className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Record Your Thoughts</h3>
                          <p className="text-sm text-muted-foreground">Capture audio moments in seconds</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Set Future Unlock Dates</h3>
                          <p className="text-sm text-muted-foreground">Choose when to revisit your memories</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Secure Encryption</h3>
                          <p className="text-sm text-muted-foreground">Your memories stay private until unlock</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Unlock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Discover Past Entries</h3>
                          <p className="text-sm text-muted-foreground">Hear from your past self when the time comes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
              <p className="text-muted-foreground md:text-xl max-w-[700px] mx-auto">
                EchoVerse makes it easy to create time-locked audio diaries
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Record</h3>
                <p className="text-muted-foreground">
                  Capture your thoughts, feelings, and experiences in your own voice
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Encrypt</h3>
                <p className="text-muted-foreground">
                  Your entries are securely encrypted and stored until their unlock date
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Unlock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Discover</h3>
                <p className="text-muted-foreground">
                  Rediscover your past self when entries unlock on their scheduled date
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} EchoVerse. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
