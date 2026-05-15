import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { ImageIcon, Loader2Icon, TrashIcon } from "lucide-react"
import { type ChangeEvent, type ComponentProps, useRef, useState } from "react"
import { toast } from "sonner"
import { trpc } from "~/lib/trpc"

type ImageUploadProps = Omit<ComponentProps<"div">, "onChange"> & {
  workspaceId: string
  sessionId: string
  value?: string | null
  onChange: (url: string | null) => void
  accept?: string
}

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp"

export const ImageUpload = ({
  workspaceId,
  sessionId,
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  className,
  ...props
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const createUpload = trpc.storage.public.createAdvertiserUpload.useMutation()

  const handlePick = () => inputRef.current?.click()

  const handleClear = () => onChange(null)

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = "" // allow re-picking the same file
    if (!file) return

    try {
      setIsUploading(true)
      const presigned = await createUpload.mutateAsync({
        workspaceId,
        sessionId,
        fileName: file.name,
        contentType: file.type,
        contentLength: file.size,
      })

      // Presigned POST: every field from the signature must be in the form,
      // and the file must come last (S3 requirement).
      const form = new FormData()
      for (const [name, value] of Object.entries(presigned.fields)) {
        form.append(name, value)
      }
      form.append("file", file)

      const uploadResponse = await fetch(presigned.uploadUrl, {
        method: "POST",
        body: form,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed (${uploadResponse.status})`)
      }

      onChange(presigned.publicUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cx("flex items-center gap-3", className)} {...props}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {value ? (
        <div className="flex flex-1 items-center gap-3">
          <img src={value} alt="" className="size-12 rounded border object-cover" />
          <span className="flex-1 truncate text-muted-foreground text-xs">{value}</span>
          <Button type="button" variant="ghost" prefix={<TrashIcon />} onClick={handleClear}>
            Remove
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          prefix={isUploading ? <Loader2Icon className="animate-spin" /> : <ImageIcon />}
          onClick={handlePick}
          disabled={isUploading}
        >
          {isUploading ? "Uploading…" : "Upload image"}
        </Button>
      )}
    </div>
  )
}
