'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useVoxTranscribeShort, useVoxTranscribeLong, useVoxTranscribeOnly } from '@/hooks/use-vox-flow'
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
  const [copied, setCopied] = useState(false)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)

  const transcribeShortMut = useVoxTranscribeShort()
  const transcribeLongMut = useVoxTranscribeLong()
  const transcribeOnlyMut = useVoxTranscribeOnly()

  // Create and cleanup preview URL for uploaded files
  useEffect(() => {
    if (fileSelection?.type === 'file' && fileSelection.file) {
      const url = URL.createObjectURL(fileSelection.file)
      setAudioPreviewUrl(url)
      return () => URL.revokeObjectURL(url) // Cleanup
    } else if (fileSelection?.type === 'sample') {
      setAudioPreviewUrl('/sample_audio.wav')
    } else {
      setAudioPreviewUrl(null)
    }
  }, [fileSelection])

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

      <CardContent className="px-0 space-y-2.5">
        <div className="space-y-1.5">
          <div className={`group relative border-2 border-dashed transition-all duration-300 rounded-2xl p-3 overflow-hidden ${fileSelection ? 'bg-blue-50/10 border-blue-100' : 'border-slate-100 bg-slate-50/50'}`}>
            <Label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block px-1 text-left">Audio Source</Label>
            <div className="min-h-20 w-full flex flex-col justify-center bg-white rounded-xl shadow-xs border border-slate-100 p-2 hover:border-blue-400/30 transition-all">
              {fileSelection ? (
                <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1 gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="h-7 w-7 bg-blue-50/50 rounded-lg flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                          <FileAudio className={`h-3.5 w-3.5 ${fileSelection.type === 'sample' ? 'text-indigo-600' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex flex-col text-left flex-1 min-w-0">
                          <h4 className="text-[10px] font-bold text-slate-800 tracking-tight truncate w-full">{fileSelection.name}</h4>
                          {fileSelection.type === 'sample' && <span className="text-[8px] text-indigo-600 font-semibold flex items-center gap-1 truncate w-full"><Zap className="h-2 w-2 shrink-0"/> Sample Audio</span>}
                        </div>
                      </div>
                      <button onClick={() => setFileSelection(null)} className="text-[8px] font-bold text-slate-500 hover:text-red-500 transition-colors bg-white border border-slate-200 px-2 py-1 rounded-md shadow-xs shrink-0">
                        Remove
                      </button>
                    </div>
                  {audioPreviewUrl && (
                    <audio 
                      key={audioPreviewUrl}
                      controls 
                      className="w-full h-7 rounded-md"
                      style={{ filter: 'hue-rotate(200deg) saturate(0.8)' }}
                    >
                      <source src={audioPreviewUrl} type={fileSelection.file?.type || 'audio/wav'} />
                    </audio>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-1">
                  <Upload className="h-4 w-4 text-slate-300 mb-1" />
                  <h4 className="text-[10px] font-bold text-slate-700 mb-2">Upload Audio</h4>
                  <label className="cursor-pointer inline-flex items-center justify-center rounded-lg text-[9px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 h-7 px-4 shadow-xs">
                    Browse Files
                    <input type="file" className="hidden" accept="audio/*" onChange={(e) => e.target.files?.[0] && setFileSelection({ type: 'file', name: e.target.files[0].name, file: e.target.files[0] })} />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

            <div className="grid grid-cols-2 gap-2 p-2 bg-blue-50/20 rounded-xl border border-blue-100/30">
              <div className="space-y-0.5">
                <Label className="text-[8px] font-bold text-blue-600 uppercase tracking-widest px-1">Type</Label>
                <Select value={transcribeType} onValueChange={setTranscribeType}>
                  <SelectTrigger className="bg-white h-7 text-[10px] border-blue-100/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="transcribe-only">Raw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-0.5">
                <Label className="text-[8px] font-bold text-blue-600 uppercase tracking-widest px-1">Language</Label>
                <Select value={transcribeLang} onValueChange={setTranscribeLang}>
                  <SelectTrigger className="bg-white h-7 text-[10px] border-blue-100/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="nepali">Nepali</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
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
                  <span className="h-3 w-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : 'Run Transcription'}
            </Button>
          {transcriptionResult && (
            <div className="pt-1.5 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-400">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm relative group/result overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[8px] font-bold px-1.5 py-0">
                    {transcriptionResult.model_used || 'STT'}
                  </Badge>
                  <Badge variant="outline" className="text-[7px] h-3.5 py-0 px-1 border-green-200 bg-green-50 text-green-600">200 OK</Badge>
                </div>

                <div className="space-y-3">
                  <div className="relative group/text">
                    <div className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100 text-[11px] text-slate-800 leading-relaxed font-medium pr-14 transition-all group-hover/text:border-blue-200 max-h-32 overflow-y-auto custom-scrollbar">
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transcription</div>
                      {transcriptionResult.transcription || 'No text found.'}
                    </div>
                    <Button 
                      className="absolute top-1 right-1 h-5 px-1.5 text-[8px] font-bold bg-white/80 backdrop-blur-xs border border-slate-200 text-slate-600 hover:bg-white hover:text-blue-600 shadow-xs transition-all opacity-0 group-hover/text:opacity-100"
                      onClick={() => copyToClipboard(transcriptionResult.transcription || '')}
                    >
                      <Zap className="h-2 w-2 mr-1 text-blue-500" />
                      Copy
                    </Button>
                  </div>

                  {transcriptionResult.translation && (
                    <div className="relative group/trans">
                      <div className="p-2.5 bg-indigo-50/30 rounded-lg border border-indigo-100/30 text-[11px] text-slate-800 leading-relaxed font-medium italic pr-14 transition-all group-hover/trans:border-indigo-300 max-h-32 overflow-y-auto custom-scrollbar">
                        <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-1 not-italic">Translation</div>
                        {transcriptionResult.translation}
                      </div>
                      <Button 
                        className="absolute top-1 right-1 h-5 px-1.5 text-[8px] font-bold bg-white/80 backdrop-blur-xs border border-indigo-200 text-indigo-600 hover:bg-white hover:text-indigo-700 shadow-xs transition-all opacity-0 group-hover/trans:opacity-100"
                        onClick={() => copyToClipboard(transcriptionResult.translation || '')}
                      >
                        <Zap className="h-2 w-2 mr-1 text-indigo-500" />
                        Copy
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  )
}
