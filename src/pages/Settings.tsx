import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Settings, Lock, Moon, Sun, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [darkMode, setDarkMode] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Load theme
  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      setDarkMode(true)
    }
  }, [])

  const toggleTheme = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const updatePassword = async () => {
    if (password.length < 6) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      })

      setPassword('')
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Settings className="w-7 h-7 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* Password */}
        <Card className="rounded-2xl bg-[var(--card)]">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 font-semibold">
              <Lock className="w-5 h-5" />
              Change Password
            </div>

            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              onClick={updatePassword}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </Button>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="rounded-2xl bg-[var(--card)]">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              {darkMode ? <Moon /> : <Sun />}
              App Theme
            </div>

            <Switch checked={darkMode} onCheckedChange={toggleTheme} />
          </CardContent>
        </Card>

        {/* Back */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
