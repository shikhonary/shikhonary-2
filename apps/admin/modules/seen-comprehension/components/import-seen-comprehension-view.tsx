"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportSeenComprehensions,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-seen-comprehension"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { RenderMath } from "@workspace/ui/components/render-math"
import {
  ArrowLeft,
  Upload,
  Copy,
  CheckCircle2,
  Wand2,
  AlertTriangle,
  Code,
  FileText,
  Layers,
  BookOpen,
} from "lucide-react"
import { SEEN_COMPREHENSION_TYPES } from "@workspace/utils"

const sampleJsonTemplate = `[
  {
    "comprehensionType": "SEEN_COMPREHENSION_1",
    "title": "Unit 1, Lesson 1: Bangabandhu's Childhood",
    "instruction": "Read the passage carefully and answer the questions following it:",
    "passage": "Sheikh Mujibur Rahman was born in the village of Tungipara under Gopalganj district on 17 March 1920. His father Sheikh Lutfar Rahman was a serestadar in the Gopalganj civil court.",
    "difficulty": "MEDIUM",
    "reference": ["Dhaka Board 2024"],
    "questions": [
      {
        "groupNumber": 1,
        "groupTitle": "1. Choose the correct answer from the following alternatives:",
        "itemLabel": "a",
        "type": "MCQ",
        "question": "Where was Sheikh Mujibur Rahman born?",
        "options": [
          { "key": "i", "text": "Dhaka" },
          { "key": "ii", "text": "Tungipara" },
          { "key": "iii", "text": "Khulna" },
          { "key": "iv", "text": "Faridpur" }
        ],
        "answer": "ii",
        "marks": 1.0
      },
      {
        "groupNumber": 2,
        "groupTitle": "2. Write 'True' for correct statement and 'False' for incorrect statement.",
        "itemLabel": "a",
        "type": "TRUE_FALSE",
        "question": "Sheikh Mujibur Rahman was born in Gopalganj town.",
        "answer": "False. Correct Answer: Sheikh Mujibur Rahman was born in the village of Tungipara under Gopalganj district.",
        "marks": 1.0
      },
      {
        "groupNumber": 3,
        "groupTitle": "3. Answer the following questions in 2-3 sentences:",
        "itemLabel": "a",
        "type": "SHORT_ANSWER",
        "question": "What was the profession of Bangabandhu's father?",
        "answer": "He was a serestadar in the Gopalganj civil court.",
        "marks": 2.0
      }
    ]
  }
]`

export function repairJsonSyntax(raw: string): string {
  let cleaned = raw.trim()
  cleaned = cleaned.replace(/^```(?:json)?\s*/gi, "").replace(/\s*```$/g, "").trim()
  cleaned = cleaned.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
  cleaned = cleaned.replace(/^\s*\/\/.*$/gm, "")
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1")
  if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
    cleaned = `[\n${cleaned}\n]`
  }
  return cleaned
}

export function ImportSeenComprehensionView() {
  const router = useRouter()
  const importMutation = useImportSeenComprehensions()

  const [selectedClassId, setSelectedClassId] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedChapterId, setSelectedChapterId] = useState("")
  const [jsonInput, setJsonInput] = useState("")
  const [parsedItems, setParsedItems] = useState<any[] | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const handleValidateAndParse = () => {
    setParseError(null)
    setParsedItems(null)

    if (!jsonInput.trim()) {
      setParseError("Please paste JSON content to import.")
      return
    }

    try {
      const repaired = repairJsonSyntax(jsonInput)
      const parsed = JSON.parse(repaired)

      if (!Array.isArray(parsed)) {
        throw new Error("JSON root must be an array of seen comprehension objects.")
      }

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i]
        if (!item.passage || typeof item.passage !== "string") {
          throw new Error(`Item #${i + 1} is missing a required "passage" text field.`)
        }
      }

      setParsedItems(parsed)
      toast.success(`Successfully parsed ${parsed.length} seen comprehension(s)!`)
    } catch (err: any) {
      setParseError(err?.message || "Invalid JSON syntax.")
      toast.error(err?.message || "JSON parsing error")
    }
  }

  const handleAutoRepair = () => {
    try {
      const repaired = repairJsonSyntax(jsonInput)
      setJsonInput(repaired)
      toast.success("Repaired JSON syntax (stripped markdown, trailing commas, normalized quotes).")
    } catch {
      toast.error("Auto repair could not fix the JSON.")
    }
  }

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleJsonTemplate)
    toast.success("Sample template copied to clipboard!")
  }

  const handleImport = async () => {
    if (!selectedSubjectId) {
      toast.error("Please select an academic subject first.")
      return
    }

    if (!parsedItems || parsedItems.length === 0) {
      toast.error("Please parse and validate the JSON items first.")
      return
    }

    try {
      const payload = parsedItems.map((item) => ({
        subjectId: selectedSubjectId,
        academicChapterId: selectedChapterId || null,
        comprehensionType: item.comprehensionType || SEEN_COMPREHENSION_TYPES.SEEN_COMPREHENSION_1,
        title: item.title || null,
        passage: item.passage,
        instruction: item.instruction || null,
        source: item.source || null,
        reference: Array.isArray(item.reference) ? item.reference : [],
        session: item.session || null,
        difficulty: item.difficulty || "MEDIUM",
        totalMarks: typeof item.totalMarks === "number" ? item.totalMarks : null,
        isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
        questions: Array.isArray(item.questions)
          ? item.questions.map((q: any, qIdx: number) => ({
              groupNumber: q.groupNumber ?? 1,
              groupTitle: q.groupTitle ?? null,
              itemLabel: q.itemLabel ?? null,
              orderIndex: q.orderIndex ?? qIdx,
              type: q.type || "SHORT_ANSWER",
              question: q.question,
              options: q.options || [],
              answer: q.answer ?? null,
              explanation: q.explanation ?? null,
              marks: Number(q.marks) || 1.0,
            }))
          : [],
      }))

      await importMutation.mutateAsync({ items: payload })
      toast.success(`Successfully imported ${payload.length} Seen Comprehension(s)!`)
      router.push("/seen-comprehensions")
    } catch (err: any) {
      toast.error(err?.message || "Failed to import Seen Comprehensions")
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="rounded-xl h-9 w-9 border-outline-variant/60"
          >
            <Link href="/seen-comprehensions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-primary">
              Bulk Import Seen Comprehensions
            </h1>
            <p className="text-xs text-outline">
              Import multiple textbook reading passages and sub-questions via JSON
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyTemplate}
          className="rounded-xl h-9 text-xs font-bold gap-1.5"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Sample JSON
        </Button>
      </div>

      {/* Target Academic Classification */}
      <Card className="rounded-2xl border-outline-variant/60 shadow-xs">
        <CardHeader className="pb-3 border-b border-outline-variant/40">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-on-surface">
            <Layers className="h-4 w-4 text-primary" />
            Target Subject & Chapter
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Academic Class *</Label>
            <Select
              value={selectedClassId}
              onValueChange={(val) => {
                setSelectedClassId(val)
                setSelectedSubjectId("")
                setSelectedChapterId("")
              }}
            >
              <SelectTrigger className="rounded-xl h-10 text-xs">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {academicClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.nameEn} {cls.nameBn ? `(${cls.nameBn})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Subject *</Label>
            <Select
              value={selectedSubjectId}
              onValueChange={(val) => {
                setSelectedSubjectId(val)
                setSelectedChapterId("")
              }}
              disabled={!selectedClassId}
            >
              <SelectTrigger className="rounded-xl h-10 text-xs">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {subjects.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.nameEn} {sub.nameBn ? `(${sub.nameBn})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Chapter (Optional)</Label>
            <Select
              value={selectedChapterId}
              onValueChange={setSelectedChapterId}
              disabled={!selectedSubjectId}
            >
              <SelectTrigger className="rounded-xl h-10 text-xs">
                <SelectValue placeholder="Select Chapter" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {chapters.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    {ch.nameEn} {ch.nameBn ? `(${ch.nameBn})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* JSON Input Area */}
      <Card className="rounded-2xl border-outline-variant/60 shadow-xs">
        <CardHeader className="pb-3 border-b border-outline-variant/40 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-on-surface">
            <Code className="h-4 w-4 text-primary" />
            Paste JSON Payload
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAutoRepair}
            className="rounded-lg h-7 text-xs font-bold gap-1 text-primary hover:bg-primary/10"
          >
            <Wand2 className="h-3 w-3" />
            Auto-Repair Syntax
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={12}
            placeholder={sampleJsonTemplate}
            className="font-mono text-xs leading-relaxed rounded-xl"
          />

          {parseError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleValidateAndParse}
              className="rounded-xl h-10 px-6 text-xs font-bold gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Validate & Preview
            </Button>

            {parsedItems && parsedItems.length > 0 && (
              <Button
                type="button"
                onClick={handleImport}
                disabled={!selectedSubjectId || importMutation.isPending}
                className="rounded-xl h-10 px-8 text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-md"
              >
                <Upload className="h-4 w-4" />
                {importMutation.isPending
                  ? "Importing..."
                  : `Confirm Import (${parsedItems.length} items)`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parsed Items Preview */}
      {parsedItems && parsedItems.length > 0 && (
        <Card className="rounded-2xl border-outline-variant/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-outline-variant/40">
            <CardTitle className="text-sm font-bold flex items-center justify-between text-on-surface">
              <span>Preview Parsed Records ({parsedItems.length})</span>
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Ready for Import
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 divide-y divide-outline-variant/40 space-y-4">
            {parsedItems.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-primary">#{idx + 1}</span>
                    {item.title && (
                      <span className="font-bold text-xs text-on-surface">{item.title}</span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {item.comprehensionType || "SEEN_COMPREHENSION_1"}
                  </Badge>
                </div>
                <div className="text-xs text-outline line-clamp-2 bg-surface-container-low p-2.5 rounded-lg border">
                  <RenderMath text={item.passage} />
                </div>
                {Array.isArray(item.questions) && (
                  <div className="text-[11px] text-primary/80 font-medium">
                    📝 {item.questions.length} sub-question(s) included
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
