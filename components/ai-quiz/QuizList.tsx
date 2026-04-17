'use client'

import React, { useState } from 'react'
import { useQuizzes, useDocuments } from '@/hooks/useAiQuiz'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, ListChecks, Loader2, Calendar, FileText, Eye, X, ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { aiQuizAPI } from '@/lib/aiQuizApi'

interface QuizListProps {
    onSelectQuiz: (quiz: any) => void
    showCreateFormOnly?: boolean
    showQuizListOnly?: boolean
    onQuizCreated?: () => void
}

export function QuizList({ onSelectQuiz, showCreateFormOnly = false, showQuizListOnly = false, onQuizCreated }: QuizListProps) {
    const { data: quizzes = [], isLoading: quizzesLoading } = useQuizzes()
    const { data: documents = [] } = useDocuments()
    const queryClient = useQueryClient()
    
    const [docId, setDocId] = useState('')
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(['Easy'])
    const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(['mcq'])
    const [isGenerating, setIsGenerating] = useState(false)
    const [selectedQuizForAdd, setSelectedQuizForAdd] = useState<any | null>(null)

    const { mutate: createQuizMutation, isPending: creating } = useMutation({
        mutationFn: (data: { title: string; document_id: string; question_ids: number[] }) => 
            aiQuizAPI.createQuiz(data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] })
            toast.success(`Quiz "${variables.title}" created with ${variables.question_ids.length} questions!`)
            setDocId('')
            // Redirect to Manage Quizzes tab
            onQuizCreated?.()
        },
        onError: (error: any) => {
            console.error('Quiz creation failed:', error)
            toast.error(`Failed to create quiz: ${error.message || 'Unknown error'}`)
        }
    })

    const handleGenerateQuestions = async () => {
        if (!docId) {
            toast.error('Please select a document')
            return
        }
        if (selectedDifficulties.length === 0) {
            toast.error('Please select at least one difficulty level')
            return
        }
        if (selectedQuestionTypes.length === 0) {
            toast.error('Please select at least one question type')
            return
        }

        setIsGenerating(true)
        try {
            await aiQuizAPI.generateQuestions({
                difficulties: selectedDifficulties,
                document_id: docId,
                question_types: selectedQuestionTypes
            })
            
            // Fetch the generated questions
            const response = await aiQuizAPI.getQuestions(undefined, { 
                documentId: docId,
                page: 1,
                limit: 20
            })
            
            // Handle different response formats
            const questions = Array.isArray(response) ? response : (response as any).questions || (response as any).data || []
            
            if (questions.length === 0) {
                toast.error('No questions were generated')
                return
            }
            
            // Find the selected document to get its filename/title
            const selectedDocument = documents.find((doc: any) => doc.document_id === docId)
            const autoTitle = selectedDocument?.title || selectedDocument?.filename || 'Untitled Quiz'
            
            // Auto-create quiz with document filename as title
            const questionIds = questions.map((q: any) => q.id)
            createQuizMutation({
                title: autoTitle,
                document_id: docId,
                question_ids: questionIds
            })
            
        } catch (error: any) {
            console.error('Question generation failed:', error)
            toast.error(`Generation failed: ${error.message || 'Unknown error'}`)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleGenerateQuestionsForQuiz = async () => {
        if (!selectedQuizForAdd) return
        if (selectedDifficulties.length === 0) {
            toast.error('Please select at least one difficulty level')
            return
        }
        if (selectedQuestionTypes.length === 0) {
            toast.error('Please select at least one question type')
            return
        }

        setIsGenerating(true)
        try {
            await aiQuizAPI.generateQuestions({
                difficulties: selectedDifficulties,
                document_id: selectedQuizForAdd.document_id,
                question_types: selectedQuestionTypes
            })
            
            queryClient.invalidateQueries({ queryKey: ['questions'] })
            toast.success('Questions generated successfully!')
            setSelectedQuizForAdd(null)
        } catch (error: any) {
            console.error('Question generation failed:', error)
            toast.error(`Generation failed: ${error.message || 'Unknown error'}`)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleAddQuestions = (quiz: any) => {
        setSelectedQuizForAdd(quiz)
    }

    const toggleDifficulty = (difficulty: string) => {
        setSelectedDifficulties(prev =>
            prev.includes(difficulty)
                ? prev.filter(d => d !== difficulty)
                : [...prev, difficulty]
        )
    }

    const toggleQuestionType = (type: string) => {
        setSelectedQuestionTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
    }

    return (
        <div className="space-y-10">
            {/* Question Generation Form - Only in Questions tab */}
            {!selectedQuizForAdd && !showQuizListOnly && (
                <Card className="border-none shadow-premium bg-white/40 backdrop-blur-xl ring-1 ring-black/5 overflow-hidden rounded-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
                    <CardHeader className="relative pb-2">
                        <CardTitle className="text-xl font-bold flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <Plus className="w-5 h-5" />
                            </div>
                            Create New Quiz
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                            Quiz will be automatically created with the selected document 
                        </p>
                    </CardHeader>
                    <CardContent className="relative pt-0">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600">Difficulty Levels</label>
                                    <div className="flex gap-1.5">
                                        {['Easy', 'Medium', 'Hard'].map((difficulty) => {
                                            const isSelected = selectedDifficulties.includes(difficulty);
                                            return (
                                                <button
                                                    key={difficulty}
                                                    type="button"
                                                    onClick={() => toggleDifficulty(difficulty)}
                                                    className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
                                                        isSelected 
                                                            ? 'bg-slate-900 text-white' 
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {difficulty}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600">Question Types</label>
                                    <div className="flex gap-1.5">
                                        {[
                                            { value: 'mcq', label: 'MCQ' },
                                            { value: 'faq', label: 'FAQ' }
                                        ].map((type) => {
                                            const isSelected = selectedQuestionTypes.includes(type.value);
                                            return (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => toggleQuestionType(type.value)}
                                                    className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
                                                        isSelected 
                                                            ? 'bg-slate-900 text-white' 
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {type.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600">Source Document</label>
                                <Select 
                                    value={docId} 
                                    onValueChange={setDocId}
                                    disabled={isGenerating || creating}
                                >
                                    <SelectTrigger className="bg-white border-none shadow-soft focus:ring-primary h-10 rounded-lg text-sm">
                                        <SelectValue placeholder="Which document?" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        {documents.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-slate-500">
                                                No documents yet.
                                            </div>
                                        ) : (
                                            documents.map((doc: any) => (
                                                <SelectItem 
                                                    key={doc.document_id} 
                                                    value={doc.document_id}
                                                    className="focus:bg-primary/5 rounded-lg py-2"
                                                >
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                        {doc.title || 'Untitled'}
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button 
                                type="button"
                                onClick={handleGenerateQuestions}
                                disabled={isGenerating || creating || !docId || selectedDifficulties.length === 0 || selectedQuestionTypes.length === 0}
                                className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                            >
                                {isGenerating || creating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {isGenerating ? 'Generating Questions...' : 'Creating Quiz...'}
                                    </>
                                ) : (
                                    <>
                                        <ListChecks className="w-4 h-4 mr-2" />
                                        Generate & Create Quiz
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Question Generation Section - Only shown when Add is clicked */}
            {selectedQuizForAdd && (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <Button
                        variant="ghost"
                        onClick={() => setSelectedQuizForAdd(null)}
                        className="gap-2 hover:bg-slate-100 rounded-lg font-bold text-slate-600 h-8"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Quiz List
                    </Button>
                    
                    <Card className="border-none shadow-premium bg-white/40 backdrop-blur-xl ring-1 ring-black/5 overflow-hidden rounded-2xl">
                        <CardHeader className="pb-2 pt-3">
                            <CardTitle className="text-sm font-bold text-slate-900">
                                Add Questions to "{selectedQuizForAdd.title}"
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2.5 pt-0 pb-3">
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600">Difficulty Levels</label>
                                    <div className="flex gap-1">
                                        {['Easy', 'Medium', 'Hard'].map((difficulty) => {
                                            const isSelected = selectedDifficulties.includes(difficulty);
                                            return (
                                                <button
                                                    key={difficulty}
                                                    type="button"
                                                    onClick={() => toggleDifficulty(difficulty)}
                                                    className={`flex-1 px-1.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                                                        isSelected 
                                                            ? 'bg-slate-900 text-white' 
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {difficulty}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600">Question Types</label>
                                    <div className="flex gap-1">
                                        {[
                                            { value: 'mcq', label: 'MCQ' },
                                            { value: 'faq', label: 'FAQ' }
                                        ].map((type) => {
                                            const isSelected = selectedQuestionTypes.includes(type.value);
                                            return (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => toggleQuestionType(type.value)}
                                                    className={`flex-1 px-1.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                                                        isSelected 
                                                            ? 'bg-slate-900 text-white' 
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {type.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <Button 
                                type="button"
                                onClick={handleGenerateQuestionsForQuiz}
                                disabled={isGenerating || selectedDifficulties.length === 0 || selectedQuestionTypes.length === 0}
                                className="w-full h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Questions'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quiz List Section - Only shown when not in create form only mode */}
            {!showCreateFormOnly && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-bold text-slate-800">Your Quizzes</h3>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                            {quizzes.length} Total
                        </div>
                    </div>
                
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzesLoading && quizzes.length === 0 ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-40 rounded-3xl bg-slate-100/50 animate-pulse border border-slate-200/50" />
                            ))
                        ) : quizzes.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-xl rounded-2xl border border-dashed border-slate-200 shadow-soft text-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                    <ListChecks className="w-8 h-8 text-slate-200" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-700">No quizzes available</h4>
                                <p className="text-sm text-slate-500 max-w-60">
                                    {showQuizListOnly 
                                        ? 'Go to the "Questions" tab to create your first quiz.'
                                        : 'Create your first quiz using the form above to start managing questions.'}
                                </p>
                            </div>
                        ) : (
                            quizzes.map((quiz: any) => (
                                <Card 
                                    key={quiz.id} 
                                    className="group border-none shadow-soft hover:shadow-premium bg-white/60 backdrop-blur-xl transition-all duration-300 rounded-2xl overflow-hidden ring-1 ring-black/5 hover:-translate-y-1"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                                <ListChecks className="w-5 h-5" />
                                            </div>
                                            <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-bold bg-white/50 py-0.5 border-slate-200">
                                                Ready
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                                            {quiz.title}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(quiz.created_at).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="flex-1 rounded-lg h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
                                                onClick={() => onSelectQuiz(quiz)}
                                            >
                                                <Eye className="w-4 h-4 mr-1.5" />
                                                View
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="flex-1 rounded-lg h-9 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold"
                                                onClick={() => handleAddQuestions(quiz)}
                                            >
                                                <Plus className="w-4 h-4 mr-1.5" />
                                                Add
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
