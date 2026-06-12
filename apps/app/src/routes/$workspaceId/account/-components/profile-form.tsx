import { getInitials, toBase64 } from "@dirstack/utils"
import { ALLOWED_IMAGE_TYPES, fileSchema, userSchema } from "@openads/db/schema"
import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { Button } from "@openads/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Stack } from "@openads/ui/stack"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { ImageUpIcon, Trash2Icon } from "lucide-react"
import { type ChangeEvent, type ComponentProps, useRef, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { FormButton } from "~/components/form-button"
import { Card } from "~/components/ui/card"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { useZodForm } from "~/hooks/use-zod-form"
import { handleMutationError } from "~/lib/handle-mutation-error"
import { logger } from "~/lib/logger"
import { orpc, queryClient, type RouterOutputs } from "~/lib/orpc"

type AvatarState =
  | { kind: "unchanged" }
  | { kind: "selected"; file: File; previewUrl: string }
  | { kind: "removed" }

type AccountProfileFormProps = ComponentProps<"div"> & {
  user: RouterOutputs["user"]["me"]
}

export const AccountProfileForm = ({ user, ...props }: AccountProfileFormProps) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const schema = userSchema.pick({ name: true })

  const form = useZodForm(schema, {
    values: user,
  })

  const [avatar, setAvatar] = useState<AvatarState>({ kind: "unchanged" })

  const previewUrl =
    avatar.kind === "selected" ? avatar.previewUrl : avatar.kind === "removed" ? null : user.image

  const uploadImage = useMutation(
    orpc.storage.uploadUserImage.mutationOptions({
      onError: error => {
        logger.error("storage.uploadUserImage failed", { err: error })
        toast.error("Failed to upload image")
      },
    }),
  )

  const updateProfile = useMutation(
    orpc.user.update.mutationOptions({
      onError: error => handleMutationError({ error, form }),
    }),
  )

  const isSubmitting = uploadImage.isPending || updateProfile.isPending

  const handleFileChange = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    const { data: file, error } = await fileSchema.safeParseAsync(target.files?.[0])

    target.value = ""

    if (error) {
      toast.error(`The selected file is not valid: ${z.treeifyError(error).errors[0]}`)
      return
    }

    try {
      setAvatar({ kind: "selected", file, previewUrl: await toBase64(file) })
    } catch (error) {
      logger.error("failed to read avatar file", { err: error })
      toast.error("Unable to read the selected file")
    }
  }

  const handleRemoveAvatar = () => {
    setAvatar({ kind: "removed" })
  }

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      let imagePayload: string | null | undefined

      switch (avatar.kind) {
        case "removed": {
          imagePayload = null
          break
        }

        case "selected": {
          const uploadResult = await uploadImage.mutateAsync({
            file: avatar.previewUrl,
            fileName: avatar.file.name,
            contentType: avatar.file.type,
            cacheControl: "public, max-age=31536000",
          })

          imagePayload = uploadResult.url
          break
        }

        case "unchanged": {
          imagePayload = undefined
          break
        }
      }

      await updateProfile.mutateAsync({
        name: values.name,
        image: imagePayload,
      })

      form.reset({}, { keepValues: true })

      toast.success("Profile updated")

      // Refresh the user cache and route context before dropping the local preview —
      // previewUrl falls back to `user.image` once avatar resets, so the loader data
      // must already be fresh to avoid flashing the stale image.
      await queryClient.invalidateQueries({ queryKey: orpc.user.me.key() })
      await router.invalidate()

      setAvatar({ kind: "unchanged" })
    } catch (error) {
      logger.error("profile update failed", { err: error })
    }
  }

  return (
    <Card asChild {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <Form {...form}>
          <Card.Section>
            <Header>
              <HeaderTitle size="h4">Profile</HeaderTitle>

              <HeaderDescription>
                Update your personal details and how other users see you across the platform.
              </HeaderDescription>
            </Header>

            <div className="grid gap-6 max-w-xl">
              <Stack size="lg" direction="column">
                <Avatar className="size-14">
                  <AvatarImage src={previewUrl ?? undefined} />
                  <AvatarFallback>{getInitials(user.name, 3)}</AvatarFallback>
                </Avatar>

                <Stack size="sm">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    prefix={<ImageUpIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    isPending={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Change photo
                  </Button>

                  {previewUrl && (
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
