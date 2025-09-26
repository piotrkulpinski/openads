import { userSchema } from "@openads/db/schema"
import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { Button } from "@openads/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { getInitials, slugify } from "@primoui/utils"
import { useRouter } from "@tanstack/react-router"
import { ImageUpIcon, Loader2Icon, Trash2Icon } from "lucide-react"
import { type ChangeEvent, type ComponentProps, useRef, useState } from "react"
import { toast } from "sonner"
import type { z } from "zod"
import { FormButton } from "~/components/form-button"
import { Card } from "~/components/ui/card"
import { Header } from "~/components/ui/header"
import { Stack } from "~/components/ui/stack"
import { useMutationErrorHandler } from "~/hooks/use-mutation-error-handler"
import { useZodForm } from "~/hooks/use-zod-form"
import { fileToDataUrl } from "~/lib/helpers"
import type { RouterOutputs } from "~/lib/trpc"
import { trpc } from "~/lib/trpc"

type AvatarState = {
  dataUrl?: string
  fileName?: string
  contentType?: string
  isDirty: boolean
  isRemoved: boolean
}

type AccountProfileFormProps = ComponentProps<"div"> & {
  user: RouterOutputs["user"]["me"]
}

export const AccountProfileForm = ({ user, ...props }: AccountProfileFormProps) => {
  const trpcUtils = trpc.useUtils()
  const router = useRouter()
  const handleError = useMutationErrorHandler()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const schema = userSchema.pick({ name: true })

  const form = useZodForm(schema, {
    values: user,
  })

  const [avatar, setAvatar] = useState<AvatarState>({
    dataUrl: user.image ?? undefined,
    fileName: undefined,
    contentType: undefined,
    isDirty: false,
    isRemoved: !user.image,
  })

  const uploadImage = trpc.storage.user.uploadImage.useMutation({
    onError: error => {
      console.error(error)
      toast.error("Failed to upload image")
    },
  })

  const updateProfile = trpc.user.update.useMutation({
    onError: error => handleError({ error, form }),
  })

  const isSubmitting = uploadImage.isPending || updateProfile.isPending

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    event.target.value = ""

    try {
      const dataUrl = await fileToDataUrl(file)

      setAvatar({
        dataUrl,
        fileName: file.name,
        contentType: file.type || "image/png",
        isDirty: true,
        isRemoved: false,
      })
    } catch (error) {
      console.error(error)
      toast.error("Unable to read the selected file")
    }
  }

  const handleRemoveAvatar = () => {
    setAvatar(() => ({
      previewUrl: null,
      dataUrl: undefined,
      fileName: undefined,
      contentType: undefined,
      isDirty: true,
      isRemoved: true,
    }))
  }

  const generateObjectKey = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "png"
    const baseName = slugify(fileName.replace(/\.[^.]+$/, "")) || "avatar"

    return `${baseName}-${Date.now()}.${extension}`
  }

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      let imagePayload: string | null | undefined

      if (avatar.isRemoved && (user.image || avatar.isDirty)) {
        imagePayload = null
      } else if (avatar.isDirty && avatar.dataUrl && avatar.contentType && avatar.fileName) {
        const key = generateObjectKey(avatar.fileName)
        const uploadResult = await uploadImage.mutateAsync({
          key,
          contentType: avatar.contentType,
          data: avatar.dataUrl,
          cacheControl: "public, max-age=31536000",
        })

        imagePayload = uploadResult.url
      }

      const updatedUser = await updateProfile.mutateAsync({
        name: values.name,
        image: imagePayload,
      })

      form.reset({}, { keepValues: true })

      setAvatar({
        dataUrl: updatedUser.image ?? undefined,
        fileName: undefined,
        contentType: undefined,
        isDirty: false,
        isRemoved: !updatedUser.image,
      })

      toast.success("Profile updated")

      // Invalidate the cache
      await trpcUtils.user.me.invalidate()

      // Invalidate the route
      await router.invalidate()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card asChild {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <Form {...form}>
          <Card.Section>
            <Header
              size="h4"
              title="Profile"
              description="Update your personal details and how other users see you across the platform."
            />

            <div className="grid gap-6 max-w-xl">
              <Stack size="lg" direction="column">
                <Avatar className="size-14">
                  <AvatarImage src={avatar.dataUrl ?? undefined} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>

                <Stack size="sm">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    prefix={
                      uploadImage.isPending ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        <ImageUpIcon />
                      )
                    }
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    Change photo
                  </Button>

                  {avatar.dataUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="soft"
                      prefix={<Trash2Icon />}
                      onClick={handleRemoveAvatar}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>
              </Stack>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card.Section>

          <Card.Row direction="rowReverse">
            <FormButton isPending={isSubmitting}>Save Changes</FormButton>
          </Card.Row>
        </Form>
      </form>
    </Card>
  )
}
