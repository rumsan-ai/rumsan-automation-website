'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentManager } from '@/components/ai-quiz/DocumentManager'
import { QuizList } from '@/components/ai-quiz/QuizList'
import { QuestionManager } from '@/components/ai-quiz/QuestionManager'
import { FileText, LayoutList, Zap, BrainCircuit } from 'lucide-react'


export default function AIQuizPage() {
    const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null)
    const [activeTab, setActiveTab] = useState('documents')

    const handleSelectQuiz = (quiz: any) => {
        setSelectedQuiz(quiz)
        setActiveTab('questions')
    }

    const handleBackToQuizzes = () => {
        setSelectedQuiz(null)
        setActiveTab('questions')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navigation */}
            <nav className="shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md z-60">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between">
                        <a
                            href="/"
                            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600">
                                Rumsan Automations
                            </span>
                        </a>
                    </div>
                </div>
            </nav>

            <main className="flex-1 container mx-auto px-4 py-4 max-w-3xl">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl mb-2 bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        AI Powered Digital Literacy For Rahat
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Transform your documents into interactive quizzes using advanced AI.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" suppressHydrationWarning>
                    <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-12 p-1 bg-slate-100/50 backdrop-blur-sm rounded-xl gap-3">
                        <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-premium">
                            <FileText className="w-4 h-4 mr-2" />
                            Documents
                        </TabsTrigger>
                        <TabsTrigger value="quizzes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-premium">
                            <BrainCircuit className="w-4 h-4 mr-2" />
                            Questions
                        </TabsTrigger>
                        <TabsTrigger value="questions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-premium">
                            <LayoutList className="w-4 h-4 mr-2" />
                            Manage Quizzes
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="documents" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <DocumentManager />
                    </TabsContent>

                    <TabsContent value="quizzes" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <QuizList 
                            onSelectQuiz={handleSelectQuiz} 
                            showCreateFormOnly={true}
                            onQuizCreated={() => setActiveTab('questions')}
                        />
                    </TabsContent>

                    <TabsContent value="questions" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {selectedQuiz ? (
                            <QuestionManager quiz={selectedQuiz} onBack={handleBackToQuizzes} />
                        ) : (
                            <QuizList 
                                onSelectQuiz={handleSelectQuiz} 
                                showQuizListOnly={true}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
