import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { Layout } from "~/components/layout/layout"

// export const loginFn = createServerFn()
//   .validator(d => d as { email: string; password: string })
//   .handler(async ({ data }) => {
//     // Find the user
//     const user = await prismaClient.user.findUnique({
//       where: {
//         email: data.email,
//       },
//     })

//     // Check if the user exists
//     if (!user) {
//       return {
//         error: true,
//         userNotFound: true,
//         message: "User not found",
//       }
//     }

//     // Check if the password is correct
//     const hashedPassword = await hashPassword(data.password)

//     if (user.password !== hashedPassword) {
//       return {
//         error: true,
//         message: "Incorrect password",
//       }
//     }

//     // Create a session
//     const session = await useAppSession()

//     // Store the user's email in the session
//     await session.update({
//       userEmail: user.email,
//     })
//   })

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: () => {
    return (
      <Layout>
        <Outlet />
      </Layout>
    )
  },
})
