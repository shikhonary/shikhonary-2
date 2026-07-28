"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useCreateChapter, useUpdateChapter } from "../services/use-chapter"
import { useSubjectsForSelection } from "@/modules/subject/services/use-subject"
import { useChapterModalStore } from "../store/use-chapter-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

const chapterFormSchema = z.object({
  name: z.string().min(1, "English chapter name is required"),
  subjectId: z.string().min(1, "Please select a parent subject"),
  position: z.coerce.number().int().min(0, "Position must be 0 or greater"),
})

type ChapterFormData = z.infer<typeof chapterFormSchema>

export function ChapterFormDialog() {
  const { isOpen, chapter, defaultSubjectId, closeModal } = useChapterModalStore()
  const isEditing = Boolean(chapter)

  const { data: subjects = [] } = useSubjectsForSelection()

  const createMutation = useCreateChapter()
  const updateMutation = useUpdateChapter()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      name: "",
      subjectId: defaultSubjectId || "",
      position: 0,
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (chapter) {
        reset({
          name: chapter.name,
          subjectId: chapter.subjectId,
          position: chapter.position,
        })
      } else {
        reset({
          name: "",
          subjectId: defaultSubjectId || (subjects[0]?.id ?? ""),
          position: 0,
        })
      }
    }
  }, [isOpen, chapter, defaultSubjectId, reset, subjects])

  const onSubmit = async (data: ChapterFormData) => {
    try {
      if (isEditing && chapter) {
        await updateMutation.mutateAsync({
          id: chapter.id,
          ...data,
        })
        toast.success(`Chapter "${data.name}" updated successfully.`)
      } else {
        await createMutation.mutateAsync(data)
        toast.success(`Chapter "${data.name}" created successfully.`)
      }
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving chapter.")
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-2xl"
      >
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="font-headline-md text-2xl font-bold tracking-tight text-on-surface normal-case">
            {isEditing ? "Edit Chapter" : "Add New Chapter"}
          </DialogTitle>
          <DialogDescription className="font-body-md text-sm text-on-surface-variant">
            {isEditing
              ? "Update chapter details, title, and display ordering."
              : "Create a new chapter entry under an academic subject."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          {/* Parent Subject Field */}
          <div className="space-y-2">
            <Label className="font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Parent Subject <span className="text-error">*</span>
            </Label>
            <Controller
              name="subjectId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
                    <SelectValue placeholder="Select a subject..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64">
                    {subjects.map((sub) => (
                      <SelectItem
                        key={sub.id}
                        value={sub.id}
                        label={sub.name}
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>{sub.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.subjectId && (
              <p className="text-xs text-error">{errors.subjectId.message}</p>
            )}
          </div>

          {/* English Chapter Name */}
          <div className="space-y-2">
            <Label className="font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Chapter Name (English) <span className="text-error">*</span>
            </Label>
            <Input
              type="text"
              placeholder="e.g. Force and Motion"
              {...register("name")}
              className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
            />
            {errors.name && (
              <p className="text-xs text-error">{errors.name.message}</p>
            )}
          </div>



          {/* Position */}
          <div className="space-y-2">
            <Label className="font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Display Position (Order)
            </Label>
            <Input
              type="number"
              min={0}
              {...register("position")}
              className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
            />
            {errors.position && (
              <p className="text-xs text-error">{errors.position.message}</p>
            )}
          </div>

          {/* Actions Footer */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={closeModal}
              className="w-full rounded-lg border border-outline bg-transparent px-6 py-2.5 font-headline-md text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-container-high sm:w-auto h-auto cursor-pointer normal-case tracking-normal"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-headline-md text-sm font-bold text-on-primary transition-all hover:bg-primary/90 sm:w-auto h-auto cursor-pointer normal-case tracking-normal disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  <span>Saving...</span>
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Chapter"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
