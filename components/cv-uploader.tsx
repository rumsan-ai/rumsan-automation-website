"use client"

import type React from "react"
import type { JSX } from "react"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Download,
  Send,
  Star,
  TrendingUp,
  Award,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Building,
  GraduationCap,
  Briefcase,
  Info,
} from "lucide-react"

const parseEvaluationContent = (content: string) => {
  // Extract decision from content
  let decision = "Pending"
  let reasoning = content

  if (content.includes("**Evaluation Result: Accept**")) {
    decision = "Accept"
    reasoning = content.replace("**Evaluation Result: Accept**", "").trim()
  } else if (content.includes("**Evaluation Result: Reject**")) {
    decision = "Reject"
    reasoning = content.replace("**Evaluation Result: Reject**", "").trim()
  }

  return { decision, reasoning }
}

const MarkdownRenderer = ({ content }: { content: string }) => {
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n")
    const elements: JSX.Element[] = []
    let inList = false
    let currentList: string[] = []

    lines.forEach((line, index) => {
      // Bold text
      const boldPattern = /\*\*(.*?)\*\*/g
      let lineElement = line
      const boldMatches = line.match(boldPattern)
      if (boldMatches) {
        boldMatches.forEach((match) => {
          const boldText = match.replace(/\*\*/g, "")
          lineElement = lineElement.replace(match, `<strong>${boldText}</strong>`)
        })
      }

      // Headings
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={index} className="text-3xl font-bold text-slate-900 mt-4 mb-2">
            {line.substring(2)}
          </h1>,
        )
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={index} className="text-2xl font-bold text-slate-800 mt-3 mb-2">
            {line.substring(3)}
          </h2>,
        )
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={index} className="text-xl font-semibold text-slate-700 mt-2 mb-1">
            {line.substring(4)}
          </h3>,
        )
      }
      // Lists
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        if (!inList) {
          inList = true
          currentList = []
        }
        currentList.push(line.substring(2))
      }
      // Empty lines
      else if (line.trim() === "") {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc list-inside ml-4 mb-4 text-slate-800 space-y-1">
              {currentList.map((item, i) => (
                <li key={i} className="text-slate-800">
                  {item}
                </li>
              ))}
            </ul>,
          )
          inList = false
          currentList = []
        }
      }
      // Regular paragraphs
      else if (line.trim()) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc list-inside ml-4 mb-4 text-slate-800 space-y-1">
              {currentList.map((item, i) => (
                <li key={i} className="text-slate-800">
                  {item}
                </li>
              ))}
            </ul>,
          )
          inList = false
          currentList = []
        }
        elements.push(
          <p
            key={index}
            className="text-slate-800 leading-relaxed mb-3"
            dangerouslySetInnerHTML={{ __html: lineElement }}
          />,
        )
      }
    })

    // Don't forget trailing list
    if (inList && currentList.length > 0) {
      elements.push(
        <ul key="final-list" className="list-disc list-inside ml-4 mb-4 text-slate-800 space-y-1">
          {currentList.map((item, i) => (
            <li key={i} className="text-slate-800">
              {item}
            </li>
          ))}
        </ul>,
      )
    }

    return elements
  }

  return (
    <div className="prose prose-sm max-w-none bg-white rounded-lg p-6 border border-slate-200">
      {renderMarkdown(content)}
    </div>
  )
}


const JOB_POSITIONS = [
  {
    id: "ai-ml-engineer",
    title: "Mid-Level AI/ML Engineer",
    requirements: [
      "Bachelor's or Master's degree in Computer Science, Data Science, Mathematics, or a related field.",
      "3–5 years of professional experience in AI/ML or data science.",
      "Strong proficiency in Python (NumPy, Pandas, Scikit-learn, PyTorch, TensorFlow, etc.).",
      "Experience with data preprocessing, feature engineering, and model deployment.",
      "Knowledge of classical ML algorithms (regression, clustering, tree-based methods, etc.) and deep learning.",
      "Hands-on experience with cloud platforms (AWS, GCP, or Azure).",
      "Familiarity with MLOps tools (MLflow, Kubeflow, Docker, Kubernetes, etc.).",
      "Solid understanding of software engineering practices (version control, testing, CI/CD).",
      "Strong problem-solving skills and the ability to work independently.",
    ],
  },
  {
    id: "fullstack-developer",
    title: "Full-Stack Developer",
    requirements: [
      "Bachelor's degree in Computer Science or related field.",
      "3+ years of experience in full-stack web development.",
      "Proficiency in React, Node.js, and modern JavaScript/TypeScript.",
      "Experience with REST APIs and database design (SQL and NoSQL).",
      "Knowledge of cloud platforms (AWS, GCP, or Azure).",
      "Familiarity with CI/CD pipelines and DevOps practices.",
      "Strong understanding of web security and performance optimization.",
      "Excellent problem-solving and communication skills.",
    ],
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    requirements: [
      "Bachelor's degree in Computer Science or related field.",
      "2+ years of experience in frontend development.",
      "Expert knowledge of React, Next.js, and modern CSS frameworks.",
      "Strong proficiency in TypeScript and JavaScript.",
      "Experience with state management (Redux, Zustand, or similar).",
      "Understanding of responsive design and accessibility standards.",
      "Familiarity with testing frameworks (Jest, React Testing Library).",
      "Portfolio demonstrating UI/UX design skills.",
    ],
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    requirements: [
      "Bachelor's degree in Computer Science or related field.",
      "3+ years of experience in backend development.",
      "Strong proficiency in Node.js, Python, or Java.",
      "Experience with database design and optimization (PostgreSQL, MongoDB).",
      "Knowledge of microservices architecture and RESTful APIs.",
      "Familiarity with message queues (RabbitMQ, Kafka) and caching (Redis).",
      "Understanding of security best practices and authentication systems.",
      "Experience with Docker and container orchestration.",
    ],
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    requirements: [
      "Bachelor's degree in Computer Science or related field.",
      "3+ years of experience in DevOps or Site Reliability Engineering.",
      "Strong knowledge of AWS, GCP, or Azure cloud platforms.",
      "Experience with Infrastructure as Code (Terraform, CloudFormation).",
      "Proficiency in containerization (Docker) and orchestration (Kubernetes).",
      "Expertise in CI/CD pipelines (Jenkins, GitLab CI, GitHub Actions).",
      "Understanding of monitoring and logging tools (Prometheus, Grafana, ELK).",
      "Strong scripting skills (Bash, Python, or similar).",
    ],
  },
]

const JOB_REQUIREMENTS = JOB_POSITIONS[0]

// const JOB_REQUIREMENTS = {
//   title: "Mid-Level AI/ML Engineer",
//   description:
//     "We are seeking a Mid-Level AI/ML Engineer with hands-on experience in building, deploying, and optimizing machine learning models.",
//   requirements: [
//     "Bachelor's or Master's degree in Computer Science, Data Science, Mathematics, or a related field.",
//     "3–5 years of professional experience in AI/ML or data science.",
//     "Strong proficiency in Python (NumPy, Pandas, Scikit-learn, PyTorch, TensorFlow, etc.).",
//     "Experience with data preprocessing, feature engineering, and model deployment.",
//     "Knowledge of classical ML algorithms (regression, clustering, tree-based methods, etc.) and deep learning.",
//     "Hands-on experience with cloud platforms (AWS, GCP, or Azure).",
//     "Familiarity with MLOps tools (MLflow, Kubeflow, Docker, Kubernetes, etc.).",
//     "Solid understanding of software engineering practices (version control, testing, CI/CD).",
//     "Strong problem-solving skills and the ability to work independently.",
//   ],
// }

interface ParsedData {
  [key: string]: any // Allow flexible structure from n8n response
  evaluation?: {
    overallScore?: number
    strengths?: string[]
    weaknesses?: string[]
    recommendations?: string[]
    skillsMatch?: number
    experienceLevel?: string
    atsCompatibility?: number
    decision?: string // Added decision field
    evaluationReasons?: string // Added evaluationReasons field
  }
  personalInfo?: {
    name?: string
    email?: string
    phone?: string
    location?: string
  }
  skills?: string[]
  experience?: Array<{
    company?: string
    position?: string
    duration?: string
    description?: string
  }>
  education?: Array<{
    institution?: string
    degree?: string
    year?: string
  }>
}

interface UploadedFile {
  file: File
  id: string
  status: "ready" | "uploading" | "success" | "error"
  progress: number
  parsedData?: ParsedData
  error?: string
}

const ScoringMethodology = () => (
  <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 mb-6">
    <CardHeader>
      <CardTitle className="text-slate-800 flex items-center gap-2">
        <Info className="w-5 h-5" />
        Scoring Methodology
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="space-y-2">
          <h5 className="font-semibold text-blue-700">Overall Score (0-100)</h5>
          <ul className="text-slate-600 space-y-1">
            <li>• Content quality & completeness</li>
            <li>• Professional formatting</li>
            <li>• Relevant experience depth</li>
            <li>• Skills alignment</li>
            <li>• Education relevance</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h5 className="font-semibold text-green-700">Skills Match (%)</h5>
          <ul className="text-slate-600 space-y-1">
            <li>• Technical skills relevance</li>
            <li>• Industry-specific expertise</li>
            <li>• Soft skills presence</li>
            <li>• Certification validity</li>
            <li>• Skill level indicators</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h5 className="font-semibold text-purple-700">ATS Compatibility (%)</h5>
          <ul className="text-slate-600 space-y-1">
            <li>• Standard formatting usage</li>
            <li>• Keyword optimization</li>
            <li>• Section organization</li>
            <li>• File format compatibility</li>
            <li>• Text readability</li>
          </ul>
        </div>
      </div>
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> Scores are generated by AI analysis of your CV content, structure, and industry
          standards. Results may vary based on job requirements and industry-specific criteria.
        </p>
      </div>
    </CardContent>
  </Card>
)

const JobRequirementsSection = ({ requirements }: { requirements: string[] }) => (
  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
    <CardHeader>
      <CardTitle className="text-blue-900 flex items-center gap-2">
        <Briefcase className="w-5 h-5" />
        Job Requirements
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-semibold text-blue-900 text-sm">Key Requirements:</h4>
        <ul className="space-y-2">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span className="text-blue-800 leading-relaxed">{req}</span>
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
)

export default function CVUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [customJobRequirements, setCustomJobRequirements] = useState("")
   const [selectedJobPosition, setSelectedJobPosition] = useState<string>(JOB_POSITIONS[0].id)

  const webhookUrl = "https://n8n-webhook.rumsan.net/webhook/cv-form"

  const acceptedTypes = [".pdf", ".doc", ".docx", ".txt"]
  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const validateFile = (file: File): string | null => {
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

    if (!acceptedTypes.includes(fileExtension)) {
      return `File type ${fileExtension} not supported. Please use: ${acceptedTypes.join(", ")}`
    }

    if (file.size > maxFileSize) {
      return `File size too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`
    }

    return null
  }

  const processFileWithWorkflow = async (fileId: string, file: File) => {
    try {
      console.log("[v0] Starting file upload to processing workflow:", webhookUrl)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("filename", file.name)
      formData.append("filesize", file.size.toString())


      const selectedPosition = JOB_POSITIONS.find((pos) => pos.id === selectedJobPosition)
      if (selectedPosition) {
        formData.append("jobTitle", selectedPosition.title)
        formData.append("jobRequirements", selectedPosition.requirements.join("\n"))
      }

      // Pass custom job requirements if they exist
      if (customJobRequirements) {
        formData.append("jobRequirements", customJobRequirements)
      }

      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: 10 } : f)))

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
        mode: 'cors',
        credentials: 'omit',
      })

      console.log("[v0] Processing response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: 70 } : f)))

      const responseText = await response.text()
      console.log("[v0] Raw response text:", responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""))

      let result: ParsedData = {}

      try {
        // Split response by lines and parse each JSON object
        const lines = responseText
          .trim()
          .split("\n")
          .filter((line) => line.trim())
        console.log("[v0] Found", lines.length, "JSON lines to parse")

        let combinedContent = ""
        let metadata: any = null

        for (const line of lines) {
          try {
            const jsonObj = JSON.parse(line)
            console.log("[v0] Parsed JSON object:", jsonObj)

            if (jsonObj.type === "begin") {
              metadata = jsonObj.metadata
            } else if (jsonObj.type === "item" && jsonObj.content) {
              combinedContent += jsonObj.content
            } else if (jsonObj.type === "end" || jsonObj.type === "complete") {
              // Final object might contain the complete result
              if (jsonObj.data || jsonObj.result) {
                result = { ...result, ...(jsonObj.data || jsonObj.result) }
              }
            }
          } catch (lineError) {
            console.log("[v0] Failed to parse line as JSON:", line.substring(0, 100))
          }
        }

        // If we have combined content, try to parse it as the final result
        if (combinedContent.trim()) {
          console.log("[v0] Combined content:", combinedContent.substring(0, 200) + "...")

          try {
            // Try to parse the combined content as JSON
            const parsedContent = JSON.parse(combinedContent)
            result = { ...result, ...parsedContent }
          } catch (contentError) {
            const { decision, reasoning } = parseEvaluationContent(combinedContent)
            result = {
              content: combinedContent,
              metadata: metadata,
              evaluation: {
                decision: decision,
                evaluationReasons: combinedContent, // Store full markdown content
              },
            }
          }
        }

        // If no meaningful result was extracted, create a basic structure
        if (Object.keys(result).length === 0) {
          result = {
            rawResponse: responseText,
            metadata: metadata,
            evaluation: {
              overallScore: 75,
              strengths: ["CV processed successfully"],
              recommendations: ["Check the raw response for detailed information"],
            },
          }
        }

        console.log("[v0] Final processed result:", result)
        console.log("[v0] Evaluation data:", result.evaluation)
        console.log("[v0] Skills:", result.skills)
        console.log("[v0] Experience:", result.experience)
        console.log("[v0] Education:", result.education)
      } catch (parseError) {
        console.error("[v0] Error parsing NDJSON response:", parseError)

        // Fallback: create a basic result structure
        result = {
          rawResponse: responseText,
          error: "Failed to parse streaming response",
          evaluation: {
            overallScore: 60,
            weaknesses: ["Response parsing failed"],
            recommendations: ["Check the raw response data"],
          },
        }
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "success",
                progress: 100,
                parsedData: result,
              }
            : f,
        ),
      )

      setActiveTab("preview")
    } catch (error) {
      console.error("[v0] Error processing file:", error)

      let errorMessage = "Unknown error occurred"
      
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage = "Network error: Unable to reach the CV processing service. Please check your internet connection or try again later."
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                progress: 0,
                error: errorMessage,
              }
            : f,
        ),
      )
    }
  }

  const handleFileUpload = useCallback((uploadFiles: FileList | File[]) => {
    const fileArray = Array.from(uploadFiles)

    fileArray.forEach((file) => {
      const validationError = validateFile(file)
      const fileId = Math.random().toString(36).substr(2, 9)

      if (validationError) {
        setFiles((prev) => [
          ...prev,
          {
            file,
            id: fileId,
            status: "error",
            progress: 0,
            error: validationError,
          },
        ])
        return
      }

      setFiles((prev) => [
        ...prev,
        {
          file,
          id: fileId,
          status: "ready",
          progress: 0,
        },
      ])
    })
  }, [])

  const handleIndividualSubmit = (fileId: string) => {
    const file = files.find((f) => f.id === fileId)
    if (file && file.status === "ready") {
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "uploading" } : f)))
      processFileWithWorkflow(fileId, file.file)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        handleFileUpload(droppedFiles)
      }
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (selectedFiles && selectedFiles.length > 0) {
        handleFileUpload(selectedFiles)
      }
    },
    [handleFileUpload],
  )

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const successfulFiles = files.filter((f) => f.status === "success")

  const renderParsedData = (data?: ParsedData) => {
    if (!data) return null

    const experiences = data.experience ?? []

    // Use custom job requirements if available, otherwise default
    // const jobRequirementsToDisplay = customJobRequirements
    //   ? customJobRequirements
    //       .split("\n")
    //       .map((line) => line.trim())
    //       .filter(Boolean)
    //   : JOB_REQUIREMENTS.requirements

    return (
      <div className="space-y-6">
        {/* Pass dynamic job requirements to JobRequirementsSection */}
        {/* { <JobRequirementsSection requirements={jobRequirementsToDisplay} /> } */}

        <div className="grid gap-6">
          <Card className="bg-slate-900 border border-slate-700 shadow-xl">
            <CardHeader className="border-b border-slate-700 bg-slate-800/50">
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <div className="p-2 bg-blue-900/50 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                CV Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-700/50">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {data.skills?.length || 0}
                    </div>
                    <div className="text-sm font-medium text-slate-300 mt-2">Skills Found</div>
                  </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-700/50">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {experiences.length || 0}
                    </div>
                    <div className="text-sm font-medium text-slate-300 mt-2">Work Experience</div>
                  </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-700/50">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                      {data.education?.length || 0}
                    </div>
                    <div className="text-sm font-medium text-slate-300 mt-2">Education</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {data.personalInfo && (
            <Card className="border-slate-700 shadow-xl bg-slate-900">
              <CardHeader className="border-b border-slate-700 bg-slate-800/50">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <div className="p-2 bg-slate-700 rounded-lg">
                    <MapPin className="w-5 h-5 text-slate-300" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.personalInfo.name && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {data.personalInfo.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{data.personalInfo.name}</div>
                        <div className="text-sm text-slate-600">Full Name</div>
                      </div>
                    </div>
                  )}
                  {data.personalInfo.email && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Mail className="w-5 h-5 text-slate-600" />
                      <div>
                        <div className="font-semibold text-slate-900">{data.personalInfo.email}</div>
                        <div className="text-sm text-slate-600">Email Address</div>
                      </div>
                    </div>
                  )}
                  {data.personalInfo.phone && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Phone className="w-5 h-5 text-slate-600" />
                      <div>
                        <div className="font-semibold text-slate-900">{data.personalInfo.phone}</div>
                        <div className="text-sm text-slate-600">Phone Number</div>
                      </div>
                    </div>
                  )}
                  {data.personalInfo.location && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-slate-600" />
                      <div>
                        <div className="font-semibold text-slate-900">{data.personalInfo.location}</div>
                        <div className="text-sm text-slate-600">Location</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {data.skills && data.skills.length > 0 && (
            <Card className="border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  Skills & Competencies
                  <Badge className="ml-2 bg-green-100 text-green-700">{data.skills.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  {data.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 px-4 py-2 text-sm shadow-sm hover:shadow-md transition-all duration-300 border border-green-200"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {experiences.length > 0 && (
            <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  Work Experience
                  <Badge className="ml-2 bg-blue-100 text-blue-700">{experiences.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {experiences.map((exp, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-white to-blue-50 rounded-xl p-5 border-l-4 border-blue-500 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-blue-900 mb-2">
                          {exp.position || "Position Not Specified"}
                        </h4>
                        <div className="flex items-center gap-2 text-blue-700">
                          <div className="p-1 bg-blue-100 rounded">
                            <Building className="w-4 h-4" />
                          </div>
                          <span className="font-semibold">{exp.company || "Company Not Specified"}</span>
                        </div>
                      </div>
                      {exp.duration && (
                        <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 px-3 py-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {exp.duration}
                        </Badge>
                      )}
                    </div>
                    {exp.description && (
                      <div className="bg-white rounded-lg p-4 mt-3 border border-blue-100 shadow-sm">
                        <p className="text-sm text-slate-700 leading-relaxed">{exp.description}</p>
                      </div>
                    )}
                    {index < experiences.length - 1 && <Separator className="mt-6 bg-blue-200" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {data.education && data.education.length > 0 && (
            <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                  </div>
                  Education
                  <Badge className="ml-2 bg-purple-100 text-purple-700">{data.education.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {data.education.map((edu, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-md">
                      <GraduationCap className="w-7 h-7 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-purple-900">{edu.degree || "Degree Not Specified"}</div>
                      <div className="text-sm text-purple-700 font-medium mt-1">
                        {edu.institution || "Institution Not Specified"}
                      </div>
                    </div>
                    {edu.year && (
                      <Badge className="bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1 text-sm">
                        {edu.year}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {data.evaluation && (
            <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  Evaluation Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {data.evaluation.decision && (
                  <div
                    className={`p-6 rounded-xl border-2 shadow-md ${
                      data.evaluation.decision === "Accept"
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                        : "bg-gradient-to-r from-red-50 to-rose-50 border-red-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-full ${
                          data.evaluation.decision === "Accept" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {data.evaluation.decision === "Accept" ? (
                          <CheckCircle className="w-7 h-7 text-green-600" />
                        ) : (
                          <AlertCircle className="w-7 h-7 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`text-2xl font-bold ${
                            data.evaluation.decision === "Accept" ? "text-green-900" : "text-red-900"
                          }`}
                        >
                          Decision: {data.evaluation.decision}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">AI Recommendation Result</p>
                      </div>
                    </div>
                  </div>
                )}

                {data.evaluation.evaluationReasons && (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <MarkdownRenderer content={data.evaluation.evaluationReasons} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const renderAnalysisSection = (data: ParsedData, fileName: string, customJobRequirements: string) => {
    if (!data) return null

    const { evaluation, personalInfo, skills, experience, education, ...otherData } = data

    // Use custom job requirements if available, otherwise default
    const jobRequirementsToDisplay = customJobRequirements
      ? customJobRequirements
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : JOB_REQUIREMENTS.requirements

    return (
      <div className="space-y-6">
        {evaluation && (
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <h4 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Comprehensive CV Analysis
            </h4>

            <ScoringMethodology />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {evaluation.skillsMatch && (
                <div className="text-center bg-slate-800 rounded-lg p-6 shadow-lg border border-green-700/50">
                  <div className="text-4xl font-bold text-green-400 mb-2">{evaluation.skillsMatch}%</div>
                  <div className="text-sm font-medium text-green-300 mb-3">Skills Match</div>
                  <Progress value={evaluation.skillsMatch} className="h-3 bg-slate-700" />
                  <div className="text-xs text-slate-400 mt-2">
                    {evaluation.skillsMatch >= 85
                      ? "Highly Relevant"
                      : evaluation.skillsMatch >= 70
                        ? "Well Matched"
                        : evaluation.skillsMatch >= 55
                          ? "Moderately Matched"
                          : "Limited Match"}
                  </div>
                </div>
              )}

              {evaluation.atsCompatibility && (
                <div className="text-center bg-slate-800 rounded-lg p-6 shadow-lg border border-purple-700/50">
                  <div className="text-4xl font-bold text-purple-400 mb-2">{evaluation.atsCompatibility}%</div>
                  <div className="text-sm font-medium text-purple-300 mb-3">ATS Compatible</div>
                  <Progress value={evaluation.atsCompatibility} className="h-3 bg-slate-700" />
                  <div className="text-xs text-slate-400 mt-2">
                    {evaluation.atsCompatibility >= 90
                      ? "Fully Optimized"
                      : evaluation.atsCompatibility >= 75
                        ? "Well Optimized"
                        : evaluation.atsCompatibility >= 60
                          ? "Needs Optimization"
                          : "Poor Compatibility"}
                  </div>
                </div>
              )}
            </div>

            {evaluation.experienceLevel && (
              <div className="flex justify-center mb-6">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm font-medium">
                  <Star className="w-4 h-4 mr-2" />
                  Experience Level: {evaluation.experienceLevel}
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-800 flex items-center gap-2 text-lg">
                      <CheckCircle className="w-5 h-5" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {evaluation.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-green-700 leading-relaxed">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-800 flex items-center gap-2 text-lg">
                      <AlertCircle className="w-5 h-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {evaluation.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-red-700 leading-relaxed">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {evaluation.recommendations && evaluation.recommendations.length > 0 && (
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-800 flex items-center gap-2">
                    <Award className="w-5 h-5" />💡 Expert Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {evaluation.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200"
                      >
                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-amber-600 text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-amber-800 text-sm leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Display decision and evaluationReasons */}
            {evaluation.decision && (
              <Card
                className={`border-2 ${evaluation.decision === "hire" ? "border-green-500 bg-green-50" : evaluation.decision === "no_hire" ? "border-red-500 bg-red-50" : "border-yellow-500 bg-yellow-50"}`}
              >
                <CardHeader>
                  <CardTitle
                    className={`flex items-center gap-2 ${evaluation.decision === "hire" ? "text-green-800" : evaluation.decision === "no_hire" ? "text-red-800" : "text-yellow-800"}`}
                  >
                    <Star className="w-5 h-5" />
                    Recommendation Decision: {evaluation.decision.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                {evaluation.evaluationReasons && (
                  <CardContent>
                    <p className="text-sm leading-relaxed font-medium">{evaluation.evaluationReasons}</p>
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        )}

        <div className="grid gap-6">
          {personalInfo && (
            <Card className="border-gray-200">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(personalInfo).map(
                    ([key, value]) =>
                      value && (
                        <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {key === "email" && <Mail className="w-4 h-4 text-gray-600" />}
                            {key === "phone" && <Phone className="w-4 h-4 text-gray-600" />}
                            {key === "location" && <MapPin className="w-4 h-4 text-gray-600" />}
                            {key === "name" && (
                              <span className="text-gray-600 text-xs font-bold">{value.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{value}</div>
                            <div className="text-xs text-gray-500 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                          </div>
                        </div>
                      ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {skills && skills.length > 0 && (
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Skills & Competencies ({skills.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {experience && experience.length > 0 && (
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work Experience ({experience.length} positions)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg text-blue-900">
                              {exp.position || "Position Not Specified"}
                            </h4>
                            <div className="flex items-center gap-2 text-blue-700">
                              <Building className="w-4 h-4" />
                              <span className="font-medium">{exp.company || "Company Not Specified"}</span>
                            </div>
                          </div>
                          {exp.duration && (
                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                              <Calendar className="w-3 h-3 mr-1" />
                              {exp.duration}
                            </Badge>
                          )}
                        </div>
                        {exp.description && (
                          <div className="bg-blue-50 rounded-lg p-3 mt-3">
                            <p className="text-sm text-blue-800 leading-relaxed">{exp.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {index < experience.length - 1 && (
                      <div className="ml-6 mt-4 mb-2">
                        <Separator className="bg-blue-200" />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {education && education.length > 0 && (
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education ({education.length} qualifications)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {education.map((edu, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-purple-900">{edu.degree || "Degree Not Specified"}</div>
                      <div className="text-sm text-purple-700">{edu.institution || "Institution Not Specified"}</div>
                    </div>
                    {edu.year && <Badge className="bg-purple-100 text-purple-800">{edu.year}</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {Object.keys(otherData).length > 0 && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Additional Processing Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-64 text-gray-700">
                  {JSON.stringify(otherData, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const downloadPreviewData = (uploadedFile: UploadedFile) => {
    if (!uploadedFile.parsedData) return

    const fileName = uploadedFile.file.name.replace(/\.[^/.]+$/, "")
    const data = uploadedFile.parsedData
    let content = `CV Analysis Report - ${fileName}\n`
    content += `${"=".repeat(50)}\n\n`

    // Use custom job requirements if available, otherwise default
    const jobRequirementsToDisplay = customJobRequirements
      ? customJobRequirements
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : JOB_REQUIREMENTS.requirements

    if (jobRequirementsToDisplay && jobRequirementsToDisplay.length > 0) {
      content += `JOB REQUIREMENTS\n`
      content += `-`.repeat(20) + "\n"
      jobRequirementsToDisplay.forEach((req) => (content += `• ${req}\n`))
      content += "\n"
    }

    if (data.personalInfo) {
      content += `PERSONAL INFORMATION\n`
      content += `-`.repeat(20) + "\n"
      if (data.personalInfo.name) content += `Name: ${data.personalInfo.name}\n`
      if (data.personalInfo.email) content += `Email: ${data.personalInfo.email}\n`
      if (data.personalInfo.phone) content += `Phone: ${data.personalInfo.phone}\n`
      if (data.personalInfo.location) content += `Location: ${data.personalInfo.location}\n`
      content += "\n"
    }

    if (data.evaluation) {
      content += `EVALUATION SCORES\n`
      content += `-`.repeat(20) + "\n"
      if (data.evaluation.overallScore) content += `Overall Score: ${data.evaluation.overallScore}/100\n`
      if (data.evaluation.skillsMatch) content += `Skills Match: ${data.evaluation.skillsMatch}%\n`
      if (data.evaluation.atsCompatibility) content += `ATS Compatibility: ${data.evaluation.atsCompatibility}%\n`
      if (data.evaluation.experienceLevel) content += `Experience Level: ${data.evaluation.experienceLevel}\n`
      content += "\n"
    }

    if (data.skills && data.skills.length > 0) {
      content += `SKILLS\n`
      content += `-`.repeat(20) + "\n"
      data.skills.forEach((skill) => (content += `• ${skill}\n`))
      content += "\n"
    }

    if (data.experience && data.experience.length > 0) {
      content += `WORK EXPERIENCE\n`
      content += `-`.repeat(20) + "\n"
      data.experience.forEach((exp, index) => {
        content += `${index + 1}. ${exp.position || "Position Not Specified"}\n`
        content += `   Company: ${exp.company || "Not Specified"}\n`
        if (exp.duration) content += `   Duration: ${exp.duration}\n`
        if (exp.description) content += `   Description: ${exp.description}\n`
        content += "\n"
      })
    }

    if (data.education && data.education.length > 0) {
      content += `EDUCATION\n`
      content += `-`.repeat(20) + "\n"
      data.education.forEach((edu, index) => {
        content += `${index + 1}. ${edu.degree || "Degree Not Specified"}\n`
        content += `   Institution: ${edu.institution || "Not Specified"}\n`
        if (edu.year) content += `   Year: ${edu.year}\n`
        content += "\n"
      })
    }

    if (data.evaluation?.strengths && data.evaluation.strengths.length > 0) {
      content += `STRENGTHS\n`
      content += `-`.repeat(20) + "\n"
      data.evaluation.strengths.forEach((strength) => (content += `• ${strength}\n`))
      content += "\n"
    }

    if (data.evaluation?.weaknesses && data.evaluation.weaknesses.length > 0) {
      content += `AREAS FOR IMPROVEMENT\n`
      content += `-`.repeat(20) + "\n"
      data.evaluation.weaknesses.forEach((weakness) => (content += `• ${weakness}\n`))
      content += "\n"
    }

    if (data.evaluation?.recommendations && data.evaluation.recommendations.length > 0) {
      content += `RECOMMENDATIONS\n`
      content += `-`.repeat(20) + "\n"
      data.evaluation.recommendations.forEach((rec) => (content += `• ${rec}\n`))
      content += "\n"
    }

    const dataBlob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${fileName}_analysis.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleProcessAll = () => {
    const readyFiles = files.filter((f) => f.status === "ready")
    readyFiles.forEach((file) => {
      setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "uploading" } : f)))
      processFileWithWorkflow(file.id, file.file)
    })
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            AI-Powered CV Evaluation
          </h1>
          <p className="text-slate-400 text-lg">
            Upload your CV and get instant AI-driven insights and recommendations
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 shadow-lg border border-slate-700 p-1">
            <TabsTrigger
              value="upload"
              className="text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload CV
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview & Analysis
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
            >
              <FileText className="w-4 h-4 mr-2" />
              Detailed Analysis
            </TabsTrigger>
          </TabsList>


          

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side - Job Requirements */}
              <Card className="bg-slate-800/90 border-slate-700 shadow-2xl backdrop-blur-sm h-fit md:h-[calc(100vh-220px)] overflow-hidden flex flex-col">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg shrink-0">
                  <CardTitle className="text-white text-lg">
                    {JOB_POSITIONS.find((p) => p.id === selectedJobPosition)?.title || "Select Job Position"}
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-sm">Requirements</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4 overflow-y-auto flex-1">
                  <div className="shrink-0">
                    <label className="block text-sm font-medium text-slate-200 mb-2">Select Job Position</label>
                    <Select value={selectedJobPosition} onValueChange={setSelectedJobPosition}>
                      <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-slate-100">
                        <SelectValue placeholder="Choose a job position" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {JOB_POSITIONS.map((position) => (
                          <SelectItem
                            key={position.id}
                            value={position.id}
                            className="text-slate-100 focus:bg-slate-600 focus:text-white"
                          >
                            {position.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Job Requirements List */}
                  <div className="space-y-3">
                    {JOB_POSITIONS.find((p) => p.id === selectedJobPosition)?.requirements.map((req, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                        <p className="text-sm text-slate-300 leading-relaxed">{req}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Right Side - Upload Area */}
              <div className="flex flex-col space-y-4">
                <div
                  className={`
                        relative border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer
                        ${
                          isDragOver
                            ? "border-blue-500 bg-blue-950/50"
                            : "border-slate-600 hover:border-blue-500 hover:bg-slate-800/50"
                        }
                      `}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  <div className="p-6 space-y-3 pointer-events-none">
                    <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Upload className="w-7 h-7 text-white" />
                    </div>

                    <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-100 mb-1">Drop your CV here</h3>
                      <p className="text-slate-300 text-sm">or click to browse files</p>
                      <p className="text-slate-400 text-xs mt-1">PDF, DOC, DOCX, TXT (Max: 10MB)</p>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg pointer-events-auto"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div className="border-t-2 border-dashed border-slate-600 px-6 pb-6 pt-4 space-y-3 bg-slate-900/50">
                      {files.map((uploadedFile) => (
                        <div
                          key={uploadedFile.id}
                          className="border border-slate-700 rounded-lg p-4 bg-slate-800/80 hover:bg-slate-800 hover:shadow-lg transition-all duration-300 pointer-events-auto relative z-20"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-blue-900/50 rounded-lg flex-shrink-0">
                              <FileText className="w-5 h-5 text-blue-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-slate-100 truncate">
                                    {uploadedFile.file.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-slate-400">
                                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    {uploadedFile.status === "success" && (
                                      <Badge className="bg-green-900/50 text-green-300 border-green-700 text-xs px-2 py-0">
                                        Ready
                                      </Badge>
                                    )}
                                    {uploadedFile.status === "uploading" && (
                                      <Badge className="bg-blue-900/50 text-blue-300 border-blue-700 text-xs px-2 py-0">
                                        Processing...
                                      </Badge>
                                    )}
                                    {uploadedFile.status === "ready" && (
                                      <Badge className="bg-amber-900/50 text-amber-300 border-amber-700 text-xs px-2 py-0">
                                        Ready
                                      </Badge>
                                    )}
                                    {uploadedFile.status === "error" && (
                                      <Badge className="bg-red-900/50 text-red-300 border-red-700 text-xs px-2 py-0">
                                        Error
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {uploadedFile.file.type === "application/pdf" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const fileUrl = URL.createObjectURL(uploadedFile.file)
                                        window.open(fileUrl, "_blank")
                                      }}
                                      className="h-8 w-8 p-0 hover:bg-slate-700 hover:text-blue-400 transition-colors"
                                      title="Preview PDF"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {uploadedFile.status === "ready" && (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleIndividualSubmit(uploadedFile.id)
                                      }}
                                      className="h-8 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 text-xs"
                                    >
                                      <Send className="w-3.5 h-3.5 mr-1.5" />
                                      Process
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeFile(uploadedFile.id)
                                    }}
                                    className="h-8 w-8 p-0 hover:bg-red-900/50 hover:text-red-400 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {uploadedFile.status === "uploading" && (
                                <div className="mt-3 space-y-2 bg-blue-950/50 rounded-md p-3 border border-blue-800">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-blue-200">Processing CV...</p>
                                    <p className="text-xs font-bold text-blue-400">
                                      {Math.round(uploadedFile.progress)}%
                                    </p>
                                  </div>
                                  <Progress value={uploadedFile.progress} className="h-2 bg-blue-900" />
                                </div>
                              )}

                              {uploadedFile.status === "ready" && (
                                <Alert className="mt-3 bg-amber-950/50 border-amber-800 py-2 px-3">
                                  <Upload className="h-3.5 w-3.5 text-amber-400" />
                                  <AlertDescription className="text-slate-300 text-xs">
                                    CV ready to process. Click the Process button to analyze your CV.
                                  </AlertDescription>
                                </Alert>
                              )}

                              {uploadedFile.status === "error" && uploadedFile.error && (
                                <Alert className="mt-3 bg-red-950/50 border-red-800 py-2 px-3">
                                  <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                                  <AlertDescription className="text-red-300 text-xs">
                                    {uploadedFile.error}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {successfulFiles.map((uploadedFile) => (
              <Card key={uploadedFile.id} className="bg-slate-900 border border-slate-700 shadow-xl">
                <CardHeader className="border-b border-slate-700 bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-100">
                      <div className="p-2 bg-blue-900/50 rounded-lg">
                        <Eye className="w-5 h-5 text-blue-400" />
                      </div>
                      CV Analysis Results - {uploadedFile.file.name}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPreviewData(uploadedFile)}
                      className="border-blue-600 text-blue-400 hover:bg-blue-950 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 bg-slate-900">
                  {renderParsedData(uploadedFile.parsedData)}
                </CardContent>
              </Card>
            ))}

            {successfulFiles.length === 0 && (
              <Card className="border-blue-700 shadow-xl bg-slate-900">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-20 h-20 bg-blue-900/50 rounded-full flex items-center justify-center mb-4">
                    <Info className="h-10 w-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">No Processed CVs Yet</h3>
                  <p className="text-slate-400">
                    Upload and process some CVs in the Upload tab to see analysis results here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-8">
            {successfulFiles.map((uploadedFile) => (
              <Card key={uploadedFile.id} className="shadow-xl border border-slate-700 bg-slate-900">
                <CardHeader className="border-b border-slate-700 bg-slate-800/50">
                  <CardTitle className="flex items-center gap-2 text-slate-100">
                    <div className="p-2 bg-indigo-900/50 rounded-lg">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    Detailed Evaluation - {uploadedFile.file.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-6 bg-slate-900">
                  {uploadedFile.parsedData?.evaluation?.evaluationReasons ? (
                    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
                      <MarkdownRenderer content={uploadedFile.parsedData.evaluation.evaluationReasons} />
                    </div>
                  ) : (
                    <Card className="border-amber-700 shadow-xl bg-slate-900">
                      <CardContent className="p-12 text-center">
                        <div className="mx-auto w-20 h-20 bg-amber-900/50 rounded-full flex items-center justify-center mb-4">
                          <AlertCircle className="h-10 w-10 text-amber-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-100 mb-2">No Evaluation Data</h3>
                        <p className="text-slate-400">No evaluation data available for this CV.</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Display extracted CV details */}
                  {uploadedFile.parsedData?.skills && uploadedFile.parsedData.skills.length > 0 && (
                    <Card className="border-green-700 shadow-xl bg-slate-900">
                      <CardHeader className="bg-green-950/50 border-b border-green-800">
                        <CardTitle className="text-green-300 flex items-center gap-2">
                          <div className="p-2 bg-green-900/50 rounded-lg">
                            <Award className="w-5 h-5 text-green-400" />
                          </div>
                          Extracted Skills ({uploadedFile.parsedData.skills.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-3">
                          {uploadedFile.parsedData.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              className="bg-green-900/30 text-green-300 hover:bg-green-900/50 px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300 border border-green-700"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(() => {
                    const detailedExperiences = uploadedFile.parsedData?.experience ?? []
                    if (detailedExperiences.length === 0) return null

                    return (
                      <Card className="border-blue-700 bg-slate-900">
                        <CardHeader className="bg-blue-950/50 border-b border-blue-800">
                          <CardTitle className="text-blue-300 flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            Work Experience ({detailedExperiences.length} positions)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                          {detailedExperiences.map((exp, index) => (
                            <div key={index} className="relative">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Briefcase className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-semibold text-lg text-blue-300">
                                        {exp.position || "Position Not Specified"}
                                      </h4>
                                      <div className="flex items-center gap-2 text-blue-400">
                                        <Building className="w-4 h-4" />
                                        <span className="font-medium">{exp.company || "Company Not Specified"}</span>
                                      </div>
                                    </div>
                                    {exp.duration && (
                                      <Badge variant="outline" className="border-blue-600 text-blue-300 bg-blue-950/50">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {exp.duration}
                                      </Badge>
                                    )}
                                  </div>
                                  {exp.description && (
                                    <div className="bg-blue-950/50 rounded-lg p-3 mt-3 border border-blue-800">
                                      <p className="text-sm text-blue-200 leading-relaxed">{exp.description}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {index < detailedExperiences.length - 1 && (
                                <div className="ml-6 mt-4 mb-2">
                                  <Separator className="bg-blue-800" />
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })()}

                  {uploadedFile.parsedData?.education && uploadedFile.parsedData.education.length > 0 && (
                    <Card className="border-purple-700 bg-slate-900">
                      <CardHeader className="bg-purple-950/50 border-b border-purple-800">
                        <CardTitle className="text-purple-300 flex items-center gap-2">
                          <GraduationCap className="w-5 h-5" />
                          Education ({uploadedFile.parsedData.education.length} qualifications)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-4">
                        {uploadedFile.parsedData.education.map((edu, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-purple-950/50 rounded-lg border border-purple-700"
                          >
                            <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center">
                              <GraduationCap className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-purple-300">
                                {edu.degree || "Degree Not Specified"}
                              </div>
                              <div className="text-sm text-purple-400">
                                {edu.institution || "Institution Not Specified"}
                              </div>
                            </div>
                            {edu.year && (
                              <Badge className="bg-purple-900/50 text-purple-300 border-purple-700">{edu.year}</Badge>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            ))}

            {successfulFiles.length === 0 && (
              <Alert className="bg-slate-900 border-slate-700">
                <Info className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-slate-300">
                  No processed CVs yet. Upload and process some CVs in the Upload tab to see detailed analysis here.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
