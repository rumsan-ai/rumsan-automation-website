'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useVoxTranscribeShort, useVoxTranscribeLong, useVoxTranscribeOnly } from '@/hooks/useVoxFlow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, FileAudio, Upload, Zap, X } from 'lucide-react'

export default function TranscribeTab() {
  const { toast } = useToast()

  const [fileSelection, setFileSelection] = useState<{ type: 'sample' | 'file'; name: string; file?: File } | null>({
    type: 'sample',
    name: 'sample_audio.wav'
  })
  const [transcribeType, setTranscribeType] = useState('short')
  const [transcribeLang, setTranscribeLang] = useState('auto')
  const [transcriptionResult, setTranscriptionResult] = useState<any>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [copied, setCopied] = useState(false)

  const transcribeShortMut = useVoxTranscribeShort()
  const transcribeLongMut = useVoxTranscribeLong()
  const transcribeOnlyMut = useVoxTranscribeOnly()

  const handleTranscribe = () => {

    if (!fileSelection) return toast({ title: "Please select an audio file or use sample audio", variant: "destructive" })

    const fd = new FormData()
    const useSample = fileSelection.type === 'sample'
    
    const appendAudioAndSubmit = (audioBlob: Blob | File, filename: string) => {
      const fileToUpload = audioBlob instanceof File ? audioBlob : new File([audioBlob], filename, { type: audioBlob.type || 'audio/wav' })
      fd.append('file', fileToUpload)

      const onSuccess = (data: any) => {
        setTranscriptionResult(data)
        toast({ title: "Transcription Complete" })
      }
      const onError = (err: any) => toast({ title: "Transcription Failed", description: err.message, variant: "destructive" })

      if (transcribeType === 'short') transcribeShortMut.mutate({ formData: fd, useSample, languages: transcribeLang }, { onSuccess, onError })
      else if (transcribeType === 'long') transcribeLongMut.mutate({ formData: fd, useSample, languages: transcribeLang }, { onSuccess, onError })
      else transcribeOnlyMut.mutate({ formData: fd, type: 'short', useSample }, { onSuccess, onError })
    }

    if (useSample) {
      fetch('/sample_audio.wav')
        .then(res => res.blob())
        .then(blob => appendAudioAndSubmit(blob, 'sample_audio.wav'))
        .catch(() => toast({ title: "Failed to load sample audio", variant: "destructive" }))
    } else {
      appendAudioAndSubmit(fileSelection.file!, fileSelection.name)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: "Copied to clipboard" })
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-1 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5 text-sm text-gray-800 tracking-tight">
          <Mic className="h-3.5 w-3.5 text-blue-600" />
          Audio Transcription
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0 space-y-2">
        {fileSelection?.type === 'sample' && (
          <div className="mx-1 p-2 bg-linear-to-r from-indigo-50/50 to-blue-50/50 rounded-xl border border-indigo-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="h-4 w-4 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="h-2.5 w-2.5 text-white" />
            </div>
            <p className="text-[10px] text-indigo-900 leading-tight font-medium">
              Get started with the <span className="font-bold underline decoration-indigo-200 underline-offset-1">pre-selected sample</span>, or remove it for custom audio.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <div className={`group relative border-2 border-dashed transition-all duration-300 rounded-xl p-3 text-center overflow-hidden ${fileSelection ? 'bg-indigo-50/20 border-indigo-400/30' : 'border-slate-200 hover:border-blue-400 bg-slate-50/50'}`}>
            {fileSelection ? (
              <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center mb-1.5 border border-indigo-100 shadow-sm relative">
                  <FileAudio className={`h-5 w-5 ${fileSelection.type === 'sample' ? 'text-indigo-600 animate-pulse' : 'text-blue-600'}`} />
                </div>

                <div className="flex flex-col items-center gap-0.5 mb-2">
                  <h4 className="text-xs font-extrabold text-slate-800 tracking-tight truncate max-w-62.5">{fileSelection.name}</h4>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                    {fileSelection.type === 'sample' ? 'Ready to process' : 'Custom media'}
                  </p>
                </div>

                <button
                  onClick={() => setFileSelection(null)}
                  className="flex items-center gap-1 text-[8px] font-bold text-slate-500 hover:text-red-500 transition-colors bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-xs active:scale-95"
                >
                  <X className="h-2.5 w-2.5" />
                  Remove
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300 flex flex-col items-center py-0.5">
                <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center mb-1.5 border border-slate-200 shadow-sm">
                  <Upload className="h-4 w-4 text-slate-300" />
                </div>
                <h4 className="text-[10px] font-bold text-slate-700">Select Audio Media</h4>
                <p className="text-[8px] text-slate-500 mb-2">WAV, MP3, M4A, FLAC</p>

                <label className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-lg text-[9px] font-bold transition-all bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm h-7 px-4">
                  <Upload className="h-2.5 w-2.5 mr-1" />
                  Browse
                  <input
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFileSelection({
                          type: 'file',
                          name: e.target.files[0].name,
                          file: e.target.files[0]
                        })
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-2 p-2 bg-gray-50/50 rounded-xl border border-gray-100">
          <div className="space-y-0.5">
            <Label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Type</Label>
            <Select value={transcribeType} onValueChange={setTranscribeType}>
              <SelectTrigger className="bg-white h-7 text-[10px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short Audio</SelectItem>
                <SelectItem value="long">Long Audio</SelectItem>
                <SelectItem value="transcribe-only">Transcribe Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-0.5">
            <Label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Language</Label>
            <Select value={transcribeLang} onValueChange={setTranscribeLang}>
              <SelectTrigger className="bg-white h-7 text-[10px]">
                <SelectValue placeholder="Auto-detect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="eng_Latn">English</SelectItem>
                <SelectItem value="nep_Deva">Nepali</SelectItem>
                <SelectItem value="hin_Deva">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="w-full h-8 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 shadow-sm"
          onClick={handleTranscribe}
          disabled={transcribeShortMut.isPending || transcribeLongMut.isPending || transcribeOnlyMut.isPending}
        >
          {(transcribeShortMut.isPending || transcribeLongMut.isPending || transcribeOnlyMut.isPending) ? (
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              Processing...
            </span>
          ) : 'Run Transcription'}
        </Button>

        {transcriptionResult && (
          <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[8px] font-bold tracking-tight px-1.5 py-0">
                    {transcriptionResult.model_used || 'STT'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[7px] h-3.5 py-0 px-1 border-green-200 bg-green-50 text-green-600">200 OK</Badge>
                </div>
              </div>

              <div className="relative">
                <div className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100 text-xs text-slate-800 leading-normal font-medium pr-16">
                  {transcriptionResult.transcription || 'No text found.'}
                </div>
                <Button 
                   className="absolute bottom-1 right-1 h-6 px-2 text-[9px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs"
                   onClick={() => copyToClipboard(transcriptionResult.transcription || '')}
                >
                  <Zap className="h-2.5 w-2.5 mr-1 text-blue-500" />
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <button 
                onClick={() => setShowRaw(!showRaw)}
                className="text-[8px] font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 px-1"
              >
                {showRaw ? 'Hide' : 'Show'} Raw JSON
              </button>
              
              {showRaw && (
                <Textarea
                  className="min-h-20 font-mono text-[9px] bg-slate-900 text-green-400 p-2 rounded-lg border-0 shadow-inner animate-in fade-in duration-300"
                  readOnly
                  value={JSON.stringify(transcriptionResult, null, 2)}
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
