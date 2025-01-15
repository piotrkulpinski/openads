// import { Button } from '@openads/ui/button'
// import { Link, createFileRoute, useRouterState } from '@tanstack/react-router'
// import { Intro, IntroDescription, IntroTitle } from '~/components/intro'

// export const Route = createFileRoute('/_404')({
//   component: NotFound,
// })

// function NotFound() {
//   const pathname = useRouterState({ select: (s) => s.location.pathname })

//   return (
//     <Intro alignment="center">
//       <IntroTitle>404 Not Found</IntroTitle>

//       <IntroDescription className="max-w-md">
//         We're sorry, but the page `{pathname}` could not be found. You may have
//         mistyped the address or the page may have moved.
//       </IntroDescription>

//       <Button size="lg" className="mt-4" asChild>
//         <Link to="/">Go back home</Link>
//       </Button>
//     </Intro>
//   )
// }
