import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

const fallback = "/" as const

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(fallback),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.session) {
      throw redirect({ to: search.redirect })
    }
  },
  component: LoginComponent,
})

function LoginComponent() {
  const search = Route.useSearch()

  return (
    <div className="p-2 grid gap-2 place-items-center">
      <h3 className="text-xl">Login page</h3>
      {search.redirect ? (
        <p className="text-red-500">You need to login to access this page.</p>
      ) : (
        <p>Login to see all the cool content in here.</p>
      )}

      <button type="button" onClick={() => alert("clicked")}>
        Continue with Google
      </button>

      {/* <LoginButton
        provider="google"
        callbackURL={search.redirect}
        variant="outline"
        prefix={<img src="/images/google.svg" alt="" width={20} height={20} />}
      /> */}
    </div>
  )
}
