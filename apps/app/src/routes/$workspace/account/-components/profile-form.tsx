import { fileSchema, userSchema } from "@openads/db/schema"
import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { Button } from "@openads/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Stack } from "@openads/ui/stack"
import { getInitials } from "@primoui/utils"
import { useRouter } from "@tanstack/react-router"
import { ImageUpIcon, Trash2Icon } from "lucide-react"
import { type ChangeEvent, type ComponentProps, useRef, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { FormButton } from "~/components/form-button"
import { Card } from "~/components/ui/card"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { useMutationErrorHandler } from "~/hooks/use-mutation-error-handler"
import { useZodForm } from "~/hooks/use-zod-form"
import { fileToDataUrl } from "~/lib/helpers"
import type { RouterOutputs } from "~/lib/trpc"
import { trpc } from "~/lib/trpc"

type AvatarState = {
  file: File | null
  previewUrl: string | null
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
    file: null,
    previewUrl: user.image,
    isDirty: false,
    isRemoved: !user.image,
  })

  const uploadImage = trpc.storage.uploadUserImage.useMutation({
    onError: error => {
      console.error(error)
      toast.error("Failed to upload image")
    },
  })

  const updateProfile = trpc.user.update.useMutation({
    onError: error => handleError({ error, form }),
  })

  const isSubmitting = uploadImage.isPending || updateProfile.isPending

  const handleFileChange = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    const { data: file, error } = await fileSchema.safeParseAsync(target.files?.[0])

    target.value = ""

    if (error) {
      toast.error(`The selected file is not valid: ${z.treeifyError(error).errors[0]}`)
      return
    }

    try {
      setAvatar({
        file,
        previewUrl: await fileToDataUrl(file),
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
      file: null,
      previewUrl: null,
      isDirty: true,
      isRemoved: true,
    }))
  }

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      let imagePayload: string | null | undefined

      if (avatar.isRemoved && (user.image || avatar.isDirty)) {
        imagePayload = null
      } else if (avatar.isDirty && avatar.file && avatar.previewUrl) {
        const uploadResult = await uploadImage.mutateAsync({
          file: avatar.previewUrl,
          fileName: avatar.file.name,
          contentType: avatar.file.type,
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
        file: null,
        previewUrl: updatedUser.image,
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
            <Header>
              <HeaderTitle size="h4">Profile</HeaderTitle>

              <HeaderDescription>
                Update your personal details and how other users see you across the platform.
              </HeaderDescription>
            </Header>

            <div className="grid gap-6 max-w-xl">
              <Stack size="lg" direction="column">
                <Avatar className="size-14">
                  <AvatarImage src={avatar.previewUrl ?? undefined} />
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
                    prefix={<ImageUpIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    isPending={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Change photo
                  </Button>

                  {avatar.previewUrl && (
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
