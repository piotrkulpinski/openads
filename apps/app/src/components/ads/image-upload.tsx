import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { ImageIcon, Loader2Icon, TrashIcon } from "lucide-react"
import { type ChangeEvent, type ComponentProps, useRef, useState } from "react"
import { toast } from "sonner"
import { trpc } from "~/lib/trpc"

type ImageUploadProps = Omit<ComponentProps<"div">, "onChange"> & {
  sessionId: string
  value?: string | null
  onChange: (url: string | null) => void
  accept?: string
}

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml"

export const ImageUpload = ({
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
        sessionId,
        fileName: file.name,
        contentType: file.type,
        contentLength: file.size,
      })

      const putResponse = await fetch(presigned.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      if (!putResponse.ok) {
        throw new Error(`Upload failed (${putResponse.status})`)
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
