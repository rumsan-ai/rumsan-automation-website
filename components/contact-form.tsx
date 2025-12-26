"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CalendarClock, User, Building2, UserCheck, Calendar, FileText, CheckCircle2, Loader2 } from "lucide-react"

export function SickLeaveForm() {
  const [employeeName, setEmployeeName] = useState("")
  const [department, setDepartment] = useState("")
  const [manager, setManager] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeName.trim() || !department.trim() || !manager || !startDate || !endDate || !reason.trim()) {
      toast({
        title: "Error",
        description: "All fields are required. Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast({
        title: "Error",
        description: "End date cannot be before start date.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = {
        employeeName,
        department,
        manager,
        startDate,
        endDate,
        reason,
        submittedAt: new Date().toISOString(),
      }

      const response = await fetch("https://n8n-webhook.rumsan.net/webhook/sick-leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setIsSubmitted(true)

      // Reset form after 5 seconds
      setTimeout(() => {
        setEmployeeName("")
        setDepartment("")
        setManager("")
        setStartDate("")
        setEndDate("")
        setReason("")
        setIsSubmitted(false)
      }, 5000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="bg-[#030712] border-slate-800 shadow-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16 px-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-500/20">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white">Request Submitted Successfully!</h2>
              <p className="text-lg text-slate-400 max-w-md mx-auto leading-relaxed">
                Your sick leave request has been submitted and will be reviewed by your manager.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Returning to form in a moment...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#030712] border-slate-800 shadow-2xl">
      <CardHeader className="border-b border-slate-800 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
            <CalendarClock className="h-5 w-5 text-purple-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Submit Leave Request</CardTitle>
        </div>
        <CardDescription className="text-base text-slate-400">
          Fill in the details below to submit your sick leave request. All fields are required.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Name */}
          <div className="space-y-3">
            <Label htmlFor="employeeName" className="text-slate-300 flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4 text-slate-500" />
              Employee Name *
            </Label>
            <Input
              id="employeeName"
              type="text"
              placeholder="Enter your full name"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 h-12 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />
          </div>

          {/* Department */}
          <div className="space-y-3">
            <Label htmlFor="department" className="text-slate-300 flex items-center gap-2 text-sm font-medium">
              <Building2 className="w-4 h-4 text-slate-500" />
              Department *
            </Label>
            <Input
              id="department"
              type="text"
              placeholder="Enter your department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 h-12 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />
          </div>

          {/* Manager */}
          <div className="space-y-3">
            <Label htmlFor="manager" className="text-slate-300 flex items-center gap-2 text-sm font-medium">
              <UserCheck className="w-4 h-4 text-slate-500" />
              Manager *
            </Label>
            <Select value={manager} onValueChange={setManager} required>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-12 focus:border-purple-500 focus:ring-purple-500/20">
                <SelectValue placeholder="Select your manager" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="Raktim Shrestha" className="text-white focus:bg-slate-800">
                  Raktim Shrestha
                </SelectItem>
                <SelectItem value="Manzik Shrestha" className="text-white focus:bg-slate-800">
                  Manzik Shrestha
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="startDate" className="text-slate-300 flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-slate-500" />
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-white h-12 focus:border-purple-500 focus:ring-purple-500/20"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="endDate" className="text-slate-300 flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-slate-500" />
                End Date *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-white h-12 focus:border-purple-500 focus:ring-purple-500/20"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-3">
            <Label htmlFor="reason" className="text-slate-300 flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4 text-slate-500" />
              Reason for Leave *
            </Label>
            <Textarea
              id="reason"
              placeholder="Please provide a detailed reason for your leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all duration-200 shadow-lg shadow-purple-500/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Submit Sick Leave Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}