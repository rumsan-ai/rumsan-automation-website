import {
  Facebook,
  FileText,
  CheckCircle2,
  Mail,
  CalendarClock,
  ShieldCheck,
  Package,
  MessageSquare,
  MessageCircle,
  Mic,
  Phone,
  Bot,
  Users,
  Brain,
  Zap,
} from "lucide-react";
import { DiscordIcon, TelegramIcon } from "@/components/home/icons";
import { PAGES, URLS } from "@/constants";
import type { Workflow } from "@/components/home/types";

export const workflows: Workflow[] = [
  {
    id: "askbhunte",
    icon: Facebook,
    iconColor: "text-blue-500 border-blue-500/20 bg-blue-500/5",
    badge: "Real-time AI",
    title: "AskBhunte AI Chatbot",
    shortDescription:
      "Your all-in-one Facebook AI assistant delivering real-time market updates, bank loan rates, and verified daily news.",
    fullDescription:
      "AskBhunte is a multimodal AI assistant integrated with Facebook Messenger. It delivers real-time updates on Forex, Stocks, Gold/Silver prices, Nepalese bank loan rates, and the latest news from The Kathmandu Post — all in one conversational interface.",
    workflowUrl: PAGES.FACEBOOK_URL,
    dateCreated: new Date("2025-12-15"),
    problems: [
      "Keeping track of gold, silver, stocks, and Forex prices across multiple sources is tedious.",
      "Manually checking and comparing loan rates from various Nepali banks is inefficient.",
      "Staying updated with reliable news requires browsing multiple separate platforms.",
      "Financial advisors and investors lack a unified platform for consolidated market data.",
    ],
    useCases: [
      "Get instant, automated updates on gold, silver, stocks, and Forex markets in Messenger.",
      "Easily compare up-to-date loan rates from multiple Nepali banks to make informed decisions.",
      "Receive daily verified news updates directly from The Kathmandu Post in real-time.",
      "Empower financial advisors to provide rapid, data-backed guidance using a single interface.",
    ],
  },
  {
    id: "cv-evaluation",
    icon: FileText,
    iconColor: "text-blue-500 border-blue-500/20 bg-blue-500/5",
    badge: "AI-Powered",
    title: "CV Evaluation & Scoring",
    status: "operational",
    shortDescription:
      "Automate resume screening with AI-powered analysis, intelligent candidate evaluation, and instant detailed reports.",
    fullDescription:
      "Automatically evaluate CVs using AI. Extract information, score candidates, and generate detailed reports.",
    workflowUrl: "/cvEvaluation",
    isInternalRoute: true,
    dateCreated: new Date("2025-12-16"),
    steps: [
      {
        icon: CheckCircle2,
        title: "Select Job Position",
        description:
          "Choose the job role and requirements for candidate evaluation.",
      },
      {
        icon: FileText,
        title: "Upload Resumes",
        description: "Securely upload CVs through the portal.",
      },
      {
        icon: Zap,
        title: "AI Evaluation",
        description:
          "Automatically assess skills, experience, and match to job requirements.",
      },
      {
        icon: Mail,
        title: "Generate Reports",
        description: "Create detailed scorecards for each candidate.",
      },
    ],
    problems: [
      "Manual resume screening consumes excessive recruiter time and delays hiring.",
      "Inconsistent candidate evaluations occur across different interviewers and teams.",
      "Comparing large volumes of CVs objectively is difficult and prone to human bias.",
      "Challenges in documenting and standardizing candidate scoring disrupt the recruitment pipeline.",
    ],
    useCases: [
      "HR teams can screen hundreds of resumes instantly and efficiently with automated scoring.",
      "Enterprises can standardize evaluations across departments for consistent hiring criteria.",
      "Recruiters can objectively rank candidates and eliminate human bias in initial shortlisting.",
      "Recruitment agencies can automatically generate detailed candidate scorecards for clients.",
    ],
  },
  {
    id: "employee-leave-management",
    icon: CalendarClock,
    iconColor: "text-purple-500 border-purple-500/20 bg-purple-500/5",
    badge: "HR Automation",
    title: "Employee Leave Management",
    shortDescription:
      "Boost HR productivity and agility using AI-driven, automated leave management supporting all employee leave types.",
    fullDescription:
      "Transform your HR operations with a fully automated, AI-powered leave management solution. Effortlessly process and categorize all leave requests (sick, emergency, personal, work-from-home) directly from Gmail. Ensure data accuracy, eliminate manual errors, and gain real-time visibility into workforce availability. The system validates, deduplicates, and syncs structured leave data to Google Sheets, supporting compliance, audit trails, and scalable growth. Empower managers to focus on strategic work, reduce operational costs, and deliver a seamless employee experience.",
    isInternalRoute: true,
    dateCreated: new Date("2026-2-18"),
    problems: [
      "Manual leave processing and data entry waste valuable HR and management time.",
      "Lack of real-time leave data disrupts resource planning and project delivery.",
      "Manual errors in leave tracking lead to payroll disputes and compliance risks.",
      "No standardized process exists for handling diverse leave types like sick, emergency, or WFH.",
    ],
    useCases: [
      "Automate leave request processing directly from Gmail to save HR and management time.",
      "Gain instant visibility into employee availability for accurate project and resource planning.",
      "Ensure accurate data entry and maintain reliable records for payroll and compliance audits.",
      "Standardize workflows for all leave types to deliver a seamless experience for employees.",
    ],
  },
  {
    id: "invoice-validation",
    icon: ShieldCheck,
    iconColor: "text-orange-500 border-orange-500/20 bg-orange-500/5",
    badge: "Finance Bot",
    title: "Invoice Validation Portal",
    shortDescription:
      "Streamline finance operations with automated invoice processing, fast data extraction, and cross-department validation.",
    fullDescription:
      "Streamline invoice validation with automated extraction, notifications, and archiving.",
    image: "/invoice-validation-workflow.png",
    workflowUrl: "/invoiceValidation",
    isInternalRoute: true,
    dateCreated: new Date("2025-12-18"),
    steps: [
      {
        icon: FileText,
        title: "Upload Invoice",
        description:
          "Upload purchase receipt for warranty verification and product validation.",
      },
      {
        icon: Package,
        title: "Select Products",
        description:
          "Choose affected products and specify support type (warranty claim, troubleshooting, etc.).",
      },
      {
        icon: MessageSquare,
        title: "Describe Issue",
        description:
          "Provide detailed description of the problem and desired resolution.",
      },
      {
        icon: Mail,
        title: "Submit & Notify",
        description:
          "Submit claim and receive email confirmation with tracking details.",
      },
    ],
    problems: [
      "Manual invoice processing and data entry are slow and highly error-prone.",
      "Ensuring consistent cross-department validation for invoices is difficult.",
      "Late approvals and misplaced documents frequently delay vendor payments.",
      "High operational costs are incurred by finance teams managing manual workflows.",
    ],
    useCases: [
      "Automate invoice data extraction to speed up processing and reduce manual errors.",
      "Route invoices automatically for seamless cross-department validation and tracking.",
      "Accelerate approval cycles to ensure timely payments and maintain vendor relationships.",
      "Scale finance operations efficiently without needing to increase departmental headcount.",
    ],
  },
  {
    id: "discord-integration",
    icon: DiscordIcon,
    iconColor: "text-indigo-500 border-indigo-500/20 bg-indigo-500/5",
    badge: "Community Bot",
    title: "Discord Chatbot Integration",
    shortDescription:
      "Deploy an intelligent Discord chatbot to handle 24/7 community moderation, engagement, and automated responses.",
    fullDescription:
      "Advanced Discord bot integration with AI-powered moderation, automated responses, and community engagement features.",
    workflowUrl: PAGES.DISCORD_URL,
    isInternalRoute: false,
    dateCreated: new Date("2025-12-19"),
    problems: [
      "Managing active communities 24/7 requires constant human moderation and intervention.",
      "Answering repetitive member questions consumes excessive community manager time.",
      "Toxic behavior or spam can escalate quickly without immediate automated moderation.",
      "Onboarding new members at scale is difficult without a structured, automated process.",
    ],
    useCases: [
      "Deploy an always-on AI bot to manage the community and handle inquiries 24/7.",
      "Automate responses to frequently asked questions to free up community managers.",
      "Implement instant automated moderation to detect and remove spam or toxic content.",
      "Create seamless, automated onboarding workflows for new members joining the server.",
    ],
  },
  {
    id: "telegram-integration",
    icon: TelegramIcon,
    iconColor: "text-sky-500 border-sky-500/20 bg-sky-500/5",
    badge: "Messaging Bot",
    title: "Telegram Chatbot Integration",
    shortDescription:
      "Engage users instantly with a smart Telegram chatbot built for seamless communication and automated 24/7 support.",
    fullDescription:
      "Advanced Telegram bot integration with AI-powered responses, automated support, and seamless communication features for instant customer engagement.",
    workflowUrl: PAGES.TELEGRAM_URL,
    isInternalRoute: false,
    dateCreated: new Date("2025-12-22"),
    problems: [
      "Providing immediate customer support around the clock is costly and resource-intensive.",
      "Customers experience long wait times for answers to basic service inquiries.",
      "Broadcasting personalized updates to a large user base manually is inefficient.",
      "Handling high volumes of concurrent customer requests overwhelms human agents.",
    ],
    useCases: [
      "Provide cost-effective, 24/7 automated customer support directly within Telegram.",
      "Deliver instant AI-powered answers to basic service inquiries to eliminate wait times.",
      "Automate personalized broadcasts and notifications to engage large audiences efficiently.",
      "Scale customer service effortlessly to handle thousands of concurrent requests instantly.",
    ],
  },
  {
    id: "gmail-application",
    icon: Mail,
    iconColor: "text-red-500 border-red-500/20 bg-red-500/5",
    badge: "Email Automation",
    title: "Job Application Email Organizer",
    shortDescription:
      "Automate Gmail filtering for incoming job applications using intelligent candidate screening and smart responses.",
    fullDescription:
      "Effortless email filtering for your applications. Simply send your emails and our system will automatically filter them based on your specific requirements. The system provides automatic categorization of job applications, intelligent filtering based on subject lines and content analysis, automated responses, and seamless integration with your hiring workflow.",
    isInternalRoute: true,
    dateCreated: new Date("2026-2-2"),
    problems: [
      "Manual sorting of hundreds of job applications clutters inboxes and wastes HR time.",
      "Qualified candidates are easily overlooked or lost in crowded general email accounts.",
      "Delayed or inconsistent email responses create a poor experience for applicants.",
      "Tracking application statuses across multiple disjointed email threads is chaotic.",
    ],
    useCases: [
      "Automatically filter and categorize incoming applications to optimize HR efficiency.",
      "Intelligently surface top candidates based on subject lines and email content analysis.",
      "Deploy automated acknowledgment emails to ensure a professional candidate experience.",
      "Centralize and track all applicant communications within a structured hiring workflow.",
    ],
  },
  {
    id: "voice-agent",
    icon: Bot,
    iconColor: "text-purple-500 border-purple-500/20 bg-purple-500/5",
    badge: "AI Voice",
    title: "Rumsan AI Voice Agent",
    shortDescription:
      "An advanced AI voice assistant featuring seamless widget integration, natural conversation flow, and smart scheduling.",
    fullDescription:
      "Experience next-generation voice interactions with the AI assistant. Features advanced voice processing, contextual understanding, and seamless widget integration.",
    workflowUrl: "/voiceAgent",
    isInternalRoute: true,
    dateCreated: new Date("2025-12-26"),
    isHidden: true,
    steps: [
      {
        icon: Phone,
        title: "Start Voice Call",
        description: "Initiate a voice conversation with the AI agent.",
      },
      {
        icon: Mic,
        title: "Voice Recognition",
        description:
          "AI processes your speech in real-time with high accuracy.",
      },
      {
        icon: MessageCircle,
        title: "Intelligent Response",
        description:
          "Agent provides contextual responses through voice and text.",
      },
      {
        icon: FileText,
        title: "Conversation Transcript",
        description:
          "View complete conversation history with user and agent messages.",
      },
    ],
    problems: [
      "Explaining complex technical services through text alone often confuses potential clients.",
      "Manual handling of voice inquiries and meeting scheduling leads to delayed responses.",
      "Text-based communication creates accessibility hurdles for non-technical users.",
      "Important details from client phone conversations are frequently lost or unrecorded.",
    ],
    useCases: [
      "Use natural voice conversations to clearly explain complex services and products.",
      "Automate demo scheduling and inquiries with an always-available virtual voice agent.",
      "Provide an accessible, voice-first interface to eliminate text-based communication barriers.",
      "Automatically log and transcribe voice interactions for accurate follow-ups and insights.",
    ],
  },
  {
    id: "open-source-voice-agent",
    icon: Mic,
    iconColor: "text-green-500 border-green-500/20 bg-green-500/5",
    badge: "Open Source",
    title: "Open Source Voice Agent",
    shortDescription:
      "Deploy a free, open-source AI voice agent offering full customization, data privacy, and self-hosting capabilities.",
    fullDescription:
      "Deploy your own AI voice agent with complete control. Built on open-source technologies, this solution offers full customization, privacy, and scalability for your voice automation needs.",
    workflowUrl: "/open-source-agent",
    isInternalRoute: true,
    dateCreated: new Date("2026-1-15"),
    problems: [
      "Proprietary voice solutions lock organizations into expensive, inflexible vendor contracts.",
      "Third-party voice processing services raise significant data privacy and security concerns.",
      "Commercial voice platforms offer limited customization for niche business requirements.",
      "Scaling voice automation across large teams incurs prohibitively high licensing costs.",
    ],
    useCases: [
      "Deploy an open-source solution to avoid vendor lock-in and maintain full system control.",
      "Self-host the voice agent to ensure complete data privacy and compliance with regulations.",
      "Deeply customize the voice experience to perfectly match specific brand and business needs.",
      "Scale voice automation cost-effectively without worrying about per-user licensing fees.",
    ],
  },
  {
    id: "community-tool",
    icon: Users,
    iconColor: "text-blue-500 border-blue-500/20 bg-blue-500/5",
    badge: "ML Pipeline",
    title: "Community Tool",
    shortDescription:
      "A comprehensive ML pipeline for cleaning, normalizing, and classifying messy data with automated header extraction.",
    fullDescription:
      "A comprehensive machine learning pipeline for cleaning, normalizing, and classifying data. It automates header extraction, fuzzy matching, and classification using Celery for asynchronous task management and PostgreSQL for persistent storage, delivering structured, high-confidence results ready for downstream applications.",
    workflowUrl: "/communityTool",
    isInternalRoute: true,
    dateCreated: new Date("2026-3-10"),
    problems: [
      "Manual data cleaning and standardization of messy datasets is incredibly time-consuming.",
      "Inconsistent column headers and duplicate entries make data merging difficult.",
      "Processing massive datasets synchronously causes severe performance bottlenecks.",
      "Downstream applications struggle to utilize unstructured, unclassified data effectively.",
    ],
    useCases: [
      "Automate data cleaning and normalization for CSV, JSON, and database inputs.",
      "Utilize fuzzy matching and header extraction to standardize disparate datasets effortlessly.",
      "Leverage Celery and Redis to process massive datasets asynchronously without lag.",
      "Classify and export structured, high-confidence results to PostgreSQL for analytics.",
    ],
  },
  {
    id: "ai-quiz",
    icon: Brain,
    iconColor: "text-purple-500 border-purple-500/20 bg-purple-500/5",
    badge: "AI Quiz Platform",
    title: "AI Quiz Challenge",
    shortDescription:
      "Effortlessly transform any document into an interactive quiz. Upload content to auto-generate AI-powered assessments.",
    fullDescription:
      "A FastAPI-based AI quiz platform with full document management. Upload, delete, or link files/drive URLs, then generate quizzes and questions automatically. Built with Redis, PostgreSQL, Qdrant, and Alembic, it delivers fast, scalable, and reliable operations for AI-driven quiz creation and management. Transform documents into interactive quizzes effortlessly, making learning and assessment seamless and multilingual-ready.",
    workflowUrl: "/ai-quiz",
    isInternalRoute: true,
    dateCreated: new Date("2026-3-15"),
    problems: [
      "Manually creating comprehensive quizzes from dense documents is slow and error-prone.",
      "Retrieving relevant questions from large content repositories at scale is difficult.",
      "Managing source documents and generated quiz content separately creates inefficiencies.",
      "Adapting quizzes for different languages requires extensive manual translation efforts.",
    ],
    useCases: [
      "Automatically generate interactive quizzes and questions directly from uploaded documents.",
      "Use semantic search and Qdrant to instantly retrieve relevant questions from massive databases.",
      "Centralize document management and quiz creation within a single, streamlined platform.",
      "Leverage automated multilingual support to deploy quizzes globally without manual translation.",
    ],
  },
  {
    id: "vox-flow",
    icon: Phone,
    iconColor: "text-indigo-500 border-indigo-500/20 bg-indigo-500/5",
    badge: "Voice Flow",
    title: "VoxFlow",
    status: "operational",
    shortDescription:
      "Generate, transcribe, and transform audio seamlessly across languages. Instantly convert any voice into new languages.",
    fullDescription:
      "Voxflow is a modern web app that lets you generate, transcribe, and transform audio across languages. Upload your audio and instantly convert it into any language, creating seamless multilingual audio experiences with a scalable, responsive, and developer-friendly interface.",
    workflowUrl: "/voxFlow",
    isInternalRoute: true,
    dateCreated: new Date("2026-3-25"),
    problems: [
      "Language barriers prevent audio content from reaching diverse global audiences.",
      "Manually transcribing and translating long audio files is labor-intensive and expensive.",
      "Relying on multiple separate tools for generation, transcription, and translation is inefficient.",
      "Inconsistent user experiences across devices hinder accessibility for end-users.",
    ],
    useCases: [
      "Automatically translate and adapt audio content to break down language barriers instantly.",
      "Generate accurate, automated transcripts for meetings, lectures, and customer interactions.",
      "Combine audio generation, transcription, and translation into one seamless platform.",
      "Deliver a fully responsive, multilingual audio experience accessible on any device.",
    ],
  },
];
