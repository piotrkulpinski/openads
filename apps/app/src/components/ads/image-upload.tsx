import { ALLOWED_IMAGE_TYPES } from "@openads/db/schema"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { useMutation } from "@tanstack/react-query"
import { ImageIcon, Loader2Icon, TrashIcon } from "lucide-react"
import { type ChangeEvent, type ComponentProps, useRef } from "react"
import { toast } from "sonner"
import { client } from "~/lib/orpc"

type ImageUploadProps = Omit<ComponentProps<"div">, "onChange"> & {
  workspaceId: string
  sessionId: string
  value?: string | null
  onChange: (url: string | null) => void
  accept?: string
}

const DEFAULT_ACCEPT = ALLOWED_IMAGE_TYPES.join(",")

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

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const presigned = await client.storage.public.createAdvertiserUpload({
        workspaceId,
        sessionId,
        fileName: file.name,
        contentType: file.type,
        contentLength: file.size,
      })

      // Presigned PUT: send the file as the raw body with the signed headers.
      // The browser sets Content-Length from the body, which the URL also signs.
      const res = await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: presigned.headers,
        body: file,
      })

      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`)
      }

      return presigned.publicUrl
    },
    onSuccess: url => onChange(url),
    onError: err => toast.error(err instanceof Error ? err.message : "Upload failed"),
  })

  const handlePick = () => inputRef.current?.click()

  const handleClear = () => onChange(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = "" // allow re-picking the same file
    if (file) upload.mutate(file)
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
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <img src={value} alt="" className="size-12 shrink-0 rounded border object-cover" />
          {/* Show the file name, not the full CDN URL — a long URL is ugly and,
              as an unbreakable string, forces the form wider than its container. */}
          <span className="min-w-0 flex-1 truncate text-muted-foreground text-xs" title={value}>
            {value.split("/").pop() || value}
          </span>
          <Button
            type="button"
            variant="ghost"
            className="shrink-0"
            prefix={<TrashIcon />}
            onClick={handleClear}
          >
            Remove
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          prefix={upload.isPending ? <Loader2Icon className="animate-spin" /> : <ImageIcon />}
          onClick={handlePick}
          disabled={upload.isPending}
        >
          {upload.isPending ? "Uploading…" : "Upload image"}
        </Button>
      )}
    </div>
  )
}
