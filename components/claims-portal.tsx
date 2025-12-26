"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CheckCircle,
  Upload,
  FileText,
  Package,
  MessageSquare,
  Target,
  Check,
  Mail,
  Loader2,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClaimData {
  invoice: File | null
  products: string[]
  issueDescription: string
  resolutionSought: string
  responseDetails: string
  notificationEmail: string
  supportType: string // Added support type field
}

interface AnalysisData {
  status: string
  confidence: number
  extractedData?: {
    amount?: string
    date?: string
    vendor?: string
    items?: string[]
  }
  recommendations?: string[]
  issues?: string[]
}

interface WebhookProductsResponse {
  products?: any[] | string // Allow products to be an array or a string
  warrantyStatus?: "available" | "expired" | "unknown" | string // Added warranty status to response interface, allowing for string for flexibility
  customerName?: string // Added customer name
  vendor?: string // Added vendor
  invoiceNumber?: string // Added invoice number
  invoiceId?: string // Added invoice ID
  [key: string]: any
}

const AVAILABLE_PRODUCTS = [
  "MacBook Pro",
  "iPhone 15",
  "iPad Air",
  "Apple Watch",
  "AirPods Pro",
  "iMac",
  "Mac Mini",
  "Apple TV",
  "HomePod",
  "Magic Keyboard",
]

const SUPPORT_TYPES = ["General Questions", "Troubleshooting", "Warranty Claim"]

export function ClaimsPortal() {
  const [claimData, setClaimData] = useState<ClaimData>({
    invoice: null,
    products: [],
    issueDescription: "",
    resolutionSought: "",
    responseDetails: "",
    notificationEmail: "",
    supportType: "", // Added support type to initial state
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(5)
  const [currentStep, setCurrentStep] = useState(0) // 0 = start claim, 1 = upload, 2 = product, 3 = issue, 4 = resolution
  const [claimStarted, setClaimStarted] = useState(false)
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [executionId, setExecutionId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [webhookProducts, setWebhookProducts] = useState<string[]>([]) // Added state for webhook products
  const [webhookResponse, setWebhookResponse] = useState<string>("") // Added state to store webhook response from describe issue step

  const [warrantyStatus, setWarrantyStatus] = useState<"available" | "expired" | null>(null)
  const [showWarrantyExpiredDialog, setShowWarrantyExpiredDialog] = useState(false)
  const [showInvalidInvoiceDialog, setShowInvalidInvoiceDialog] = useState(false)
  const [showWarrantyAvailableDialog, setShowWarrantyAvailableDialog] = useState(false)
  const [userAcceptsCharges, setUserAcceptsCharges] = useState<boolean | null>(null)

  const [customerName, setCustomerName] = useState<string>("")
  const [vendor, setVendor] = useState<string>("")
  const [invoiceNumber, setInvoiceNumber] = useState<string>("")
  const [invoiceId, setInvoiceId] = useState<string>("")

  const steps = [
    {
      id: 1,
      title: "Start Claim",
      description: "Initialize process",
      icon: Target,
      completed: claimStarted,
    },
    {
      id: 2,
      title: "Upload Invoice",
      description: "Proof of purchase",
      icon: Upload,
      completed: claimData.invoice !== null,
    },
    {
      id: 3,
      title: "Select Product",
      description: "Choose affected items",
      icon: Package,
      completed: claimData.products.length > 0,
    },
    {
      id: 4,
      title: "Describe Issue",
      description: "Problem details",
      icon: MessageSquare,
      completed: claimData.issueDescription.length > 0,
    },
    {
      id: 5,
      title: "Resolution",
      description: "Email for updates",
      icon: Mail,
      completed: claimData.resolutionSought.length > 0 && claimData.notificationEmail.length > 0,
    },
  ]

  const handleGoBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      toast({
        title: "Navigated back",
        description: "Returned to previous step",
      })
    }
  }

  const handleGoNext = () => {
    if (currentStep < 4) {
      // Validate current step before proceeding
      if (currentStep === 0 && !claimStarted) {
        toast({
          title: "Please start claim first",
          description: "Click 'Start Claim' to begin the process",
          variant: "destructive",
        })
        return
      }
      if (currentStep === 1 && !claimData.invoice) {
        toast({
          title: "Please upload invoice",
          description: "Upload your invoice to continue",
          variant: "destructive",
        })
        return
      }
      if (currentStep === 2 && (claimData.products.length === 0 || !claimData.supportType)) {
        toast({
          title: "Please select products and support type",
          description: "Select affected products and support type to continue",
          variant: "destructive",
        })
        return
      }
      if (currentStep === 3 && claimData.issueDescription.length === 0) {
        toast({
          title: "Please describe the issue",
          description: "Provide a description of the problem to continue",
          variant: "destructive",
        })
        return
      }

      setCurrentStep(currentStep + 1)
      toast({
        title: "Navigated forward",
        description: "Moved to next step",
      })
    }
  }

  const canGoBack =
    currentStep > 0 &&
    !isSubmitting &&
    !showWarrantyExpiredDialog &&
    !showInvalidInvoiceDialog &&
    !showWarrantyAvailableDialog
  const canGoNext =
    currentStep < 4 &&
    !isSubmitting &&
    !showWarrantyExpiredDialog &&
    !showInvalidInvoiceDialog &&
    !showWarrantyAvailableDialog

  const handleStartClaim = async () => {
    console.log("[v0] Starting claim process...")
    setIsSubmitting(true)
    try {
      console.log("[v0] Calling webhook URL...")
      const formData = new FormData()
      formData.append("action", "start_claim")
      formData.append("timestamp", new Date().toISOString())

      const response = await fetch("/api/webhook-proxy", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)
      if (response.ok) {
        let responseData = null
        const responseText = await response.text()
        console.log("[v0] Response text:", responseText)

        if (responseText.trim()) {
          try {
            responseData = JSON.parse(responseText)
            console.log("[v0] Response data:", responseData)

            if (responseData?.resumeUrl) {
              console.log("[v0] Setting resumeUrl from start claim:", responseData.resumeUrl)
              setResumeUrl(responseData.resumeUrl)
            }

            // Store execution ID for tracking
            if (responseData?.executionId) {
              console.log("[v0] Setting executionId:", responseData.executionId)
              setExecutionId(responseData.executionId)
            }
          } catch (parseError) {
            console.log("[v0] Response is not JSON, treating as success")
          }
        } else {
          console.log(
            "[v0] Empty response - webhook triggered successfully, resumeUrl should be available from n8n workflow",
          )
        }

        console.log("[v0] Setting claimStarted to true and currentStep to 1")
        setClaimStarted(true)
        setCurrentStep(1) // Move to upload invoice step

        toast({
          title: "Claim started",
          description: "Your claim has been initiated. Please proceed with uploading your invoice.",
        })
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.log("[v0] Error starting claim:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast({
          title: "Network Error",
          description: "Unable to connect to the server. Please check your internet connection and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Failed to start claim",
          description: "There was an error starting your claim. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      console.log("[v0] Setting isSubmitting to false")
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setClaimData((prev) => ({ ...prev, invoice: file }))

      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => setInvoicePreview(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        setInvoicePreview(null)
      }

      // Skip the separate analysis call since it's also failing
      // Analysis can be done in the main workflow instead
      toast({
        title: "Invoice uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    }
  }

  const handleProductToggle = (product: string) => {
    setClaimData((prev) => ({
      ...prev,
      products: prev.products.includes(product)
        ? prev.products.filter((p) => p !== product)
        : [...prev.products, product],
    }))
  }

  const handleIssueChange = (issue: string) => {
    setClaimData((prev) => ({ ...prev, issueDescription: issue }))
  }

  const handleSubmitClaim = async () => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("action", "claim_submitted")
      formData.append("products", JSON.stringify(claimData.products))
      formData.append("issueDescription", claimData.issueDescription)
      formData.append("resolutionSought", claimData.resolutionSought)
      formData.append("responseDetails", claimData.responseDetails)
      formData.append("notificationEmail", claimData.notificationEmail)
      formData.append("supportType", claimData.supportType)
      formData.append("webhookResponse", webhookResponse)
      formData.append("analysisResult", webhookResponse) // Also send as analysisResult for compatibility

      if (customerName) formData.append("customerName", customerName)
      if (vendor) formData.append("vendor", vendor)
      if (invoiceNumber) formData.append("invoiceNumber", invoiceNumber)
      if (invoiceId) formData.append("invoiceId", invoiceId)
      if (warrantyStatus) formData.append("warrantyStatus", warrantyStatus)

      // Add execution tracking if available
      if (executionId) {
        formData.append("executionId", executionId)
      }

      if (claimData.invoice) {
        formData.append("invoice", claimData.invoice)
      }

      console.log("[v0] Submitting claim with webhook response:", webhookResponse)

      const response = await fetch("/api/submit-ticket", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        console.log("[v0] Claim submitted successfully, now sending email...")

        try {
          if (!resumeUrl) {
            console.log("[v0] No resumeUrl available for email sending")
            throw new Error("Resume URL not available for email sending")
          }

          const emailData = new FormData()
          emailData.append("targetUrl", resumeUrl) // Use resumeUrl like continue buttons do
          emailData.append("action", "send_email")
          emailData.append("notificationEmail", claimData.notificationEmail)
          emailData.append("products", JSON.stringify(claimData.products))
          emailData.append("issueDescription", claimData.issueDescription)
          emailData.append("resolutionSought", claimData.resolutionSought)
          emailData.append("supportType", claimData.supportType)
          emailData.append("webhookResponse", webhookResponse)
          emailData.append("analysisResult", webhookResponse)
          emailData.append("step", "email_notification")
          emailData.append("timestamp", new Date().toISOString())

          if (customerName) emailData.append("customerName", customerName)
          if (vendor) emailData.append("vendor", vendor)
          if (invoiceNumber) emailData.append("invoiceNumber", invoiceNumber)
          if (invoiceId) emailData.append("invoiceId", invoiceId)
          if (warrantyStatus) emailData.append("warrantyStatus", warrantyStatus)

          if (executionId) {
            emailData.append("executionId", executionId)
          }

          if (claimData.invoice) {
            emailData.append("invoice", claimData.invoice)
          }

          console.log("[v0] Sending email notification to:", claimData.notificationEmail)
          console.log("[v0] Using resumeUrl as targetUrl:", resumeUrl)

          const emailResponse = await fetch("/api/webhook-proxy", {
            method: "POST",
            body: emailData,
          })

          console.log("[v0] Email response status:", emailResponse.status)

          if (emailResponse.ok) {
            const emailResponseText = await emailResponse.text()
            console.log("[v0] Email sent successfully:", emailResponseText)
          } else {
            console.log("[v0] Email sending failed, but claim was submitted successfully")
          }
        } catch (emailError) {
          console.log("[v0] Error sending email notification:", emailError)
          // Don't fail the entire submission if email fails
        }

        setIsSubmitted(true)
        setShowSuccessMessage(true)

        // Start countdown timer
        const countdownInterval = setInterval(() => {
          setRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval)
              // Reset to home state
              setCurrentStep(0)
              setClaimStarted(false)
              setIsSubmitted(false)
              setShowSuccessMessage(false)
              setClaimData({
                invoice: null,
                products: [],
                issueDescription: "",
                resolutionSought: "",
                responseDetails: "",
                notificationEmail: "",
                supportType: "",
              })
              setWebhookResponse("")
              setWebhookProducts([])
              setResumeUrl(null)
              setExecutionId(null)
              setInvoicePreview(null)
              setRedirectCountdown(5)
              setWarrantyStatus(null) // Reset warranty status
              setUserAcceptsCharges(null) // Reset user accepts charges
              setCustomerName("")
              setVendor("")
              setInvoiceNumber("")
              setInvoiceId("")
              return 5
            }
            return prev - 1
          })
        }, 1000)

        toast({
          title: "Claim submitted successfully",
          description: "Your claim has been sent for review. You'll receive updates via email.",
        })
      } else {
        throw new Error("Failed to submit claim")
      }
    } catch (error) {
      console.log("[v0] Error submitting claim:", error)
      toast({
        title: "Submission failed",
        description: "There was an error submitting your claim. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = () => {
    return (
      claimStarted &&
      claimData.invoice !== null &&
      claimData.products.length > 0 &&
      claimData.supportType.length > 0 &&
      claimData.issueDescription.length > 0 &&
      claimData.resolutionSought.length > 0 &&
      claimData.notificationEmail.length > 0
    )
  }

  const handleContinueToProducts = async () => {
    if (claimData.invoice) {
      setIsSubmitting(true)
      let currentWarrantyStatus: "available" | "expired" = "available"

      try {
        if (!resumeUrl) {
          toast({
            title: "Workflow Error",
            description: "Resume URL not available. Please restart the claim process.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        console.log("[v0] Uploading invoice to resumeUrl:", resumeUrl)

        const formData = new FormData()
        formData.append("targetUrl", resumeUrl)
        formData.append("action", "invoice_uploaded")
        formData.append("invoice", claimData.invoice)
        formData.append("step", "upload_complete")
        formData.append("timestamp", new Date().toISOString())

        if (executionId) {
          formData.append("executionId", executionId)
        }

        const response = await fetch("/api/webhook-proxy", {
          method: "POST",
          body: formData,
        })

        console.log("[v0] Invoice upload response status:", response.status)

        if (response.ok) {
          try {
            const responseText = await response.text()
            console.log("[v0] Invoice upload response text:", responseText)

            if (responseText.trim()) {
              const responseData: WebhookProductsResponse = JSON.parse(responseText)
              console.log("[v0] Parsed response data:", responseData)

              if (responseData?.customerName) {
                console.log("[v0] Setting customer name:", responseData.customerName)
                setCustomerName(responseData.customerName)
              }
              if (responseData?.vendor) {
                console.log("[v0] Setting vendor:", responseData.vendor)
                setVendor(responseData.vendor)
              }
              if (responseData?.invoiceNumber) {
                console.log("[v0] Setting invoice number:", responseData.invoiceNumber)
                setInvoiceNumber(responseData.invoiceNumber)
              }
              if (responseData?.invoiceId) {
                console.log("[v0] Setting invoice ID:", responseData.invoiceId)
                setInvoiceId(responseData.invoiceId)
              }

              if (responseData?.products) {
                console.log("[v0] Setting products from webhook:", responseData.products)
                let productNames: string[] = []

                if (Array.isArray(responseData.products)) {
                  // Handle array format
                  productNames = responseData.products
                    .map((product: any) => {
                      if (typeof product === "string") {
                        return product
                      } else if (typeof product === "object" && product !== null) {
                        return (
                          product.product_name ||
                          product.name ||
                          product.productName ||
                          product.title ||
                          product.item ||
                          product.description ||
                          JSON.stringify(product)
                        )
                      } else {
                        return String(product)
                      }
                    })
                    .filter((name) => name && name !== "[object Object]")
                } else if (typeof responseData.products === "string") {
                  // Handle string format - split by comma and clean up
                  productNames = responseData.products
                    .split(",")
                    .map((product) => product.trim())
                    .filter((product) => product.length > 0)
                }

                console.log("[v0] Extracted product names:", productNames)

                if (productNames.length > 0) {
                  setWebhookProducts(productNames)
                } else {
                  console.log("[v0] No valid product names extracted, using default products")
                  setWebhookProducts(AVAILABLE_PRODUCTS)
                }
              } else {
                console.log("[v0] No products in webhook response, using default products")
                setWebhookProducts(AVAILABLE_PRODUCTS)
              }

              if (responseData?.warrantyStatus) {
                console.log("[v0] Warranty status received:", responseData.warrantyStatus)

                const rawWarrantyStatus = responseData.warrantyStatus.toLowerCase()

                // Check for invalid invoice or not found cases
                if (rawWarrantyStatus.includes("invalid") || rawWarrantyStatus.includes("not found")) {
                  setShowInvalidInvoiceDialog(true)
                  setIsSubmitting(false)
                  return
                } else if (rawWarrantyStatus === "expired" || rawWarrantyStatus === "unknown") {
                  currentWarrantyStatus = "expired"
                  setWarrantyStatus("expired")
                  setShowWarrantyExpiredDialog(true)
                  setIsSubmitting(false)
                  return
                } else if (rawWarrantyStatus.includes("available")) {
                  currentWarrantyStatus = "available"
                  setWarrantyStatus("available")
                  setShowWarrantyAvailableDialog(true)
                  setIsSubmitting(false)
                  return
                } else {
                  currentWarrantyStatus = "available"
                  setWarrantyStatus("available")
                }
              } else {
                // Default to available if no warranty status provided
                setWarrantyStatus("available")
              }

              if (responseData?.resumeUrl) {
                console.log("[v0] Setting resumeUrl from invoice upload:", responseData.resumeUrl)
                setResumeUrl(responseData.resumeUrl)
              }

              if (responseData?.executionId) {
                setExecutionId(responseData.executionId)
              }
            } else {
              console.log("[v0] Empty response from invoice upload, using default products")
              setWebhookProducts(AVAILABLE_PRODUCTS)
              setWarrantyStatus("available") // Default to available for empty responses
            }
          } catch (parseError) {
            console.log("[v0] Could not parse response for products, using default products")
            setWebhookProducts(AVAILABLE_PRODUCTS)
            setWarrantyStatus("available") // Default to available on parse error
          }

          if (currentWarrantyStatus === "available" && !showWarrantyAvailableDialog) {
            setCurrentStep(2)
            toast({
              title: "Invoice uploaded successfully",
              description: "Please select the affected products.",
            })
          }
        } else {
          toast({
            title: "Upload failed",
            description: "Failed to upload invoice. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error uploading invoice:", error)
        toast({
          title: "Upload failed",
          description: "Failed to upload invoice. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleWarrantyAvailableDecision = (proceed: boolean) => {
    setShowWarrantyAvailableDialog(false)

    if (proceed) {
      setCurrentStep(2)
      toast({
        title: "Warranty confirmed",
        description: "Your warranty is active. Please select the affected products.",
      })
    } else {
      // Reset to initial state
      setCurrentStep(0)
      setClaimStarted(false)
      setClaimData({
        invoice: null,
        products: [],
        issueDescription: "",
        resolutionSought: "",
        responseDetails: "",
        notificationEmail: "",
        supportType: "",
      })
      setWarrantyStatus(null)
      setUserAcceptsCharges(null)
      setWebhookProducts([])
      setWebhookResponse("")
      setResumeUrl(null)
      setExecutionId(null)
      setInvoicePreview(null)
      setCustomerName("")
      setVendor("")
      setInvoiceNumber("")
      setInvoiceId("")

      toast({
        title: "Thank you for visiting",
        description: "Feel free to contact us if you have any questions about your warranty.",
      })
    }
  }

  const handleWarrantyExpiredDecision = (acceptCharges: boolean) => {
    setUserAcceptsCharges(acceptCharges)
    setShowWarrantyExpiredDialog(false)

    if (acceptCharges) {
      setCurrentStep(2)
      toast({
        title: "Proceeding with expired warranty",
        description: "Additional charges may apply. Please select the affected products.",
      })
    } else {
      // Reset to initial state and show thank you message
      setCurrentStep(0)
      setClaimStarted(false)
      setClaimData({
        invoice: null,
        products: [],
        issueDescription: "",
        resolutionSought: "",
        responseDetails: "",
        notificationEmail: "",
        supportType: "",
      })
      setWarrantyStatus(null)
      setUserAcceptsCharges(null)
      setWebhookProducts([])
      setWebhookResponse("")
      setResumeUrl(null)
      setExecutionId(null)
      setInvoicePreview(null)
      setCustomerName("")
      setVendor("")
      setInvoiceNumber("")
      setInvoiceId("")

      toast({
        title: "Thank you for visiting",
        description:
          "We understand you don't wish to proceed with expired warranty charges. Feel free to contact us if you have any questions.",
      })
    }
  }

  const handleInvalidInvoiceDecision = () => {
    setShowInvalidInvoiceDialog(false)

    // Reset to initial state
    setCurrentStep(0)
    setClaimStarted(false)
    setClaimData({
      invoice: null,
      products: [],
      issueDescription: "",
      resolutionSought: "",
      responseDetails: "",
      notificationEmail: "",
      supportType: "",
    })
    setWarrantyStatus(null)
    setUserAcceptsCharges(null)
    setWebhookProducts([])
    setWebhookResponse("")
    setResumeUrl(null)
    setExecutionId(null)
    setInvoicePreview(null)
    setCustomerName("")
    setVendor("")
    setInvoiceNumber("")
    setInvoiceId("")

    toast({
      title: "Invoice Invalid",
      description: "Please check your invoice and try again with a valid invoice or receipt.",
      variant: "destructive",
    })
  }

  const handleContinueToIssue = async () => {
    if (claimData.products.length > 0 && claimData.supportType) {
      setCurrentStep(3)
      toast({
        title: "Proceeding to issue description",
        description: "Please describe the problem you're experiencing.",
      })
    }
  }

  const handleContinueToResolution = async () => {
    if (claimData.issueDescription.length > 0) {
      setIsSubmitting(true)
      try {
        if (!resumeUrl) {
          toast({
            title: "Workflow Error",
            description: "Resume URL not available. Please restart the claim process.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        console.log("[v0] Continuing to resolution with resumeUrl:", resumeUrl)

        const formData = new FormData()
        formData.append("targetUrl", resumeUrl)
        formData.append("action", "issue_described")
        formData.append("issueDescription", claimData.issueDescription)
        formData.append("selectedProducts", JSON.stringify(claimData.products))
        formData.append("supportType", claimData.supportType)
        formData.append("step", "issue_complete")
        formData.append("timestamp", new Date().toISOString())

        if (executionId) {
          formData.append("executionId", executionId)
        }

        const response = await fetch("/api/webhook-proxy", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const responseText = await response.text()
          console.log("[v0] Issue description response:", responseText)

          if (responseText.trim()) {
            try {
              const responseData = JSON.parse(responseText)
              console.log("[v0] Parsed response data:", responseData)

              if (responseData?.plainText) {
                // Handle the actual response format with plainText field
                console.log("[v0] Setting webhook response from plainText field:", responseData.plainText)
                setWebhookResponse(responseData.plainText)
              } else if (responseData?.output) {
                // Fallback for output field format
                console.log("[v0] Setting webhook response from output field:", responseData.output)
                setWebhookResponse(responseData.output)
              } else if (responseData?.message && responseData.message !== "Workflow was started") {
                // Handle message field if it's not the "started" message
                console.log("[v0] Setting webhook response from message field:", responseData.message)
                setWebhookResponse(responseData.message)
              } else {
                // Use raw response as fallback
                console.log("[v0] Using raw response data as webhook response")
                setWebhookResponse(JSON.stringify(responseData, null, 2))
              }

              // Update resumeUrl if provided
              if (responseData?.resumeUrl) {
                console.log("[v0] Updated resumeUrl for final step:", responseData.resumeUrl)
                setResumeUrl(responseData.resumeUrl)
              }
              if (responseData?.executionId) {
                setExecutionId(responseData.executionId)
              }
            } catch (parseError) {
              console.log("[v0] Could not parse JSON response, using raw text:", responseText)
              setWebhookResponse(responseText)
            }
          } else {
            console.log("[v0] Empty response received")
            setWebhookResponse("Analysis completed successfully.")
          }

          setCurrentStep(4)
          toast({
            title: "Proceeding to resolution",
            description: "Please provide your desired resolution and email.",
          })
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.log("[v0] Error continuing to resolution:", error)
        toast({
          title: "Error",
          description: "Failed to proceed. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="bg-slate-900 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Claim Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {steps.map((step) => {
              const Icon = step.icon
              const isCompleted = step.completed

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-2 rounded transition-colors ${
                    isCompleted ? "bg-green-900/30" : "bg-slate-800/50"
                  }`}
                >
                  <div className="shrink-0">
                    {isCompleted ? (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{step.title}</p>
                    <p className="text-xs text-gray-300 truncate">{step.description}</p>
                  </div>
                  <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {claimData.invoice && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Invoice Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{claimData.invoice.name}</p>
                    <p className="text-xs text-gray-500">{(claimData.invoice.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                {warrantyStatus && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg border ${
                      warrantyStatus === "available"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    {warrantyStatus === "available" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {warrantyStatus === "available"
                          ? "Eligible for Warranty Claim"
                          : "Ineligible for Warranty Claim"}
                      </p>
                      <p className="text-xs opacity-75">
                        {warrantyStatus === "available"
                          ? "Your warranty is still active"
                          : "Warranty has expired - additional charges may apply"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {(isAnalyzing || analysisData) && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Invoice...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Analysis Complete
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {isAnalyzing ? (
                <div className="text-xs text-gray-600">
                  <p>• Extracting invoice data...</p>
                  <p>• Validating information...</p>
                  <p>• Generating recommendations...</p>
                </div>
              ) : analysisData ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Confidence:</span>
                    <span className="text-xs text-green-600">{analysisData.confidence}%</span>
                  </div>

                  {analysisData.extractedData && (
                    <div className="text-xs space-y-1">
                      <p className="font-medium">Extracted Data:</p>
                      {analysisData.extractedData.amount && <p>Amount: {analysisData.extractedData.amount}</p>}
                      {analysisData.extractedData.date && <p>Date: {analysisData.extractedData.date}</p>}
                      {analysisData.extractedData.vendor && <p>Vendor: {analysisData.extractedData.vendor}</p>}
                    </div>
                  )}

                  {analysisData.recommendations && analysisData.recommendations.length > 0 && (
                    <div className="text-xs">
                      <p className="font-medium text-blue-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Recommendations:
                      </p>
                      {analysisData.recommendations.map((rec, index) => (
                        <p key={index} className="text-blue-600">
                          • {rec}
                        </p>
                      ))}
                    </div>
                  )}

                  {analysisData.issues && analysisData.issues.length > 0 && (
                    <div className="text-xs">
                      <p className="font-medium text-orange-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Issues Found:
                      </p>
                      {analysisData.issues.map((issue, index) => (
                        <p key={index} className="text-orange-600">
                          • {issue}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Claim Support</CardTitle>
            <p className="text-gray-600">Complete each step to submit your claim</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Navigation controls are now consolidated below */}
            {!isSubmitted ? (
              <>
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Start Your Claim</h3>
                    </div>
                    <div className="text-center space-y-4">
                      <p className="text-gray-600">Click the button below to initialize your claim process.</p>
                      <Button onClick={handleStartClaim} disabled={isSubmitting} className="w-full" size="lg">
                        {isSubmitting ? "Starting Claim..." : "Start Claim"}
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Upload Invoice</h3>
                    </div>
                    <div className="space-y-2">
                      <Label>Upload Invoice/Receipt *</Label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {claimData.invoice ? claimData.invoice.name : "Click to upload invoice/receipt"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, JPG, PNG</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    {claimData.invoice &&
                      !showWarrantyExpiredDialog &&
                      !showInvalidInvoiceDialog &&
                      !showWarrantyAvailableDialog && (
                        <Button
                          onClick={handleContinueToProducts}
                          className="w-full"
                          size="lg"
                          disabled={isAnalyzing || isSubmitting}
                        >
                          {isSubmitting ? "Processing..." : isAnalyzing ? "Analyzing Invoice..." : "Continue"}
                        </Button>
                      )}
                  </div>
                )}

                {showWarrantyExpiredDialog && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <h3 className="text-lg font-semibold text-orange-700">Warranty Expired</h3>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-orange-600" />
                          <p className="text-orange-800 font-medium">Your product warranty has expired.</p>
                        </div>
                        <p className="text-orange-700">
                          Processing your claim may incur additional charges. Would you like to proceed with the claim
                          process anyway?
                        </p>
                        <div className="bg-orange-100 border border-orange-300 rounded p-3">
                          <p className="text-sm text-orange-800">
                            <strong>Note:</strong> Additional service fees and repair costs may apply for
                            out-of-warranty claims.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => handleWarrantyExpiredDecision(true)}
                          className="flex-1 bg-orange-600 hover:bg-orange-700"
                          size="lg"
                        >
                          Yes, Proceed with Potential Charges
                        </Button>
                        <Button
                          onClick={() => handleWarrantyExpiredDecision(false)}
                          className="flex-1"
                          variant="outline"
                          size="lg"
                        >
                          No, Cancel Claim
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {showWarrantyAvailableDialog && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-700">Warranty Active</h3>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <p className="text-green-800 font-medium">
                            Great news! Your product warranty is still active.
                          </p>
                        </div>
                        <p className="text-green-700">
                          Your warranty covers repairs and replacements at no additional cost. Would you like to proceed
                          with your warranty claim?
                        </p>
                        <div className="bg-green-100 border border-green-300 rounded p-3">
                          <p className="text-sm text-green-800">
                            <strong>Benefits:</strong> Free repairs, replacements, and technical support covered under
                            warranty.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => handleWarrantyAvailableDecision(true)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="lg"
                        >
                          Yes, Proceed with Warranty Claim
                        </Button>
                        <Button
                          onClick={() => handleWarrantyAvailableDecision(false)}
                          className="flex-1"
                          variant="outline"
                          size="lg"
                        >
                          No, Cancel Claim
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {showInvalidInvoiceDialog && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-700">Invalid Invoice</h3>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <p className="text-red-800 font-medium">Invoice could not be processed</p>
                        </div>
                        <p className="text-red-700">
                          The uploaded invoice appears to be invalid or could not be found in our database. This could
                          be due to:
                        </p>
                        <ul className="text-red-700 text-sm space-y-1 ml-4">
                          <li>• Invoice is not from an authorized retailer</li>
                          <li>• Invoice format is not readable</li>
                          <li>• Missing required information (date, products, etc.)</li>
                          <li>• Invoice is corrupted or unclear</li>
                        </ul>
                        <div className="bg-red-100 border border-red-300 rounded p-3">
                          <p className="text-sm text-red-800">
                            <strong>Please:</strong> Check your invoice and try again with a valid invoice or receipt
                            from an authorized retailer.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-center pt-2">
                        <Button
                          onClick={handleInvalidInvoiceDecision}
                          className="bg-red-600 hover:bg-red-700"
                          size="lg"
                        >
                          Back to Start
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Select Product</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Choose the affected product(s) *</Label>
                        {/* {console.log("[v0] Current webhookProducts:", webhookProducts)}
                        {console.log(
                          "[v0] Using products:",
                          webhookProducts.length > 0 ? webhookProducts : AVAILABLE_PRODUCTS,
                        )} */}
                        <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg max-h-40 overflow-y-auto">
                          {(webhookProducts.length > 0 ? webhookProducts : AVAILABLE_PRODUCTS).map((product) => (
                            <div key={product} className="flex items-center space-x-2">
                              <Checkbox
                                id={product}
                                checked={claimData.products.includes(product)}
                                onCheckedChange={() => handleProductToggle(product)}
                              />
                              <Label htmlFor={product} className="text-sm font-normal">
                                {product}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {claimData.products.length > 0 && (
                          <p className="text-sm text-green-600">Selected: {claimData.products.join(", ")}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Type of support needed *</Label>
                        <div className="grid grid-cols-1 gap-2 p-4 border rounded-lg">
                          {SUPPORT_TYPES.map((supportType) => (
                            <div key={supportType} className="flex items-center space-x-2">
                              <Checkbox
                                id={supportType}
                                checked={claimData.supportType === supportType}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setClaimData((prev) => ({ ...prev, supportType }))
                                  }
                                }}
                              />
                              <Label htmlFor={supportType} className="text-sm font-normal">
                                {supportType}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {claimData.supportType && (
                          <p className="text-sm text-green-600">Selected: {claimData.supportType}</p>
                        )}
                      </div>
                    </div>
                    {claimData.products.length > 0 && claimData.supportType && (
                      <Button onClick={handleContinueToIssue} className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Processing..." : "Continue"}
                      </Button>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Describe Issue</h3>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issue">Describe the problem you're experiencing *</Label>
                      <Textarea
                        id="issue"
                        placeholder="Please provide detailed information about the issue..."
                        value={claimData.issueDescription}
                        onChange={(e) => handleIssueChange(e.target.value)}
                        rows={4}
                      />
                    </div>
                    {claimData.issueDescription.length > 0 && (
                      <Button onClick={handleContinueToResolution} className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Processing..." : "Continue"}
                      </Button>
                    )}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    {webhookResponse && (
                      <div className="space-y-2 mb-6">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Feedback Insights: </h4>
                          <div className="text-sm text-blue-700 whitespace-pre-wrap">{webhookResponse}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Resolution</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="resolution">What resolution are you seeking? *</Label>
                        <Textarea
                          id="resolution"
                          placeholder="What resolution are you looking for? (refund, replacement, repair, etc.)"
                          value={claimData.resolutionSought}
                          onChange={(e) => setClaimData((prev) => ({ ...prev, resolutionSought: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notificationEmail">Email for claim updates *</Label>
                        <Input
                          id="notificationEmail"
                          type="email"
                          placeholder="Email address for claim status updates"
                          value={claimData.notificationEmail}
                          onChange={(e) => setClaimData((prev) => ({ ...prev, notificationEmail: e.target.value }))}
                        />
                      </div>

                      {claimData.resolutionSought.length > 0 && claimData.notificationEmail.length > 0 && (
                        <Button onClick={handleSubmitClaim} className="w-full" size="lg" disabled={isSubmitting}>
                          {isSubmitting ? "Submitting Claim..." : "Submit Claim"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                  <h3 className="text-2xl font-bold text-green-700">Claim Submitted Successfully!</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600 text-lg">Your claim has been submitted and is being processed.</p>
                    <p className="text-gray-600">
                      You'll receive updates via email at{" "}
                      <span className="font-medium text-blue-600">{claimData.notificationEmail}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-blue-700">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-medium">Returning to home in {redirectCountdown} seconds...</span>
                  </div>
                </div>
              </div>
            )}
            {currentStep > 0 && !isSubmitted && (canGoBack || canGoNext) && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 mt-6">
                    
                    <Button
                    onClick={handleGoBack}
                    disabled={!canGoBack}
                    variant="secondary" // dark gray button
                    size="sm"
                    className="flex items-center gap-2 w-full sm:w-auto"
                    >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                    </Button>

                    <Button
                    onClick={handleGoNext}
                    disabled={!canGoNext}
                    variant="default" // primary blue button
                    size="sm"
                    className="flex items-center gap-2 w-full sm:w-auto"
                    >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    </Button>

                </div>
                )}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
