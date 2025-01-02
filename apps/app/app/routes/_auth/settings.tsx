import { createFileRoute } from "@tanstack/react-router"
import { Button } from "~/components/ui/button"

export const Route = createFileRoute("/_auth/settings")({
  component: SettingsComponent,
})

function SettingsComponent() {
  return (
    <div>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Account Settings
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Update your account settings and preferences.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="notification-preferences"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Notification Preferences
              </label>
              <div className="mt-2 space-y-4">
                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="campaign-updates"
                      name="campaign-updates"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="campaign-updates"
                      className="text-sm font-medium leading-6 text-gray-900"
                    >
                      Campaign Updates
                    </label>
                    <p className="text-sm text-gray-500">
                      Get notified when your campaigns reach important
                      milestones.
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="budget-alerts"
                      name="budget-alerts"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="budget-alerts"
                      className="text-sm font-medium leading-6 text-gray-900"
                    >
                      Budget Alerts
                    </label>
                    <p className="text-sm text-gray-500">
                      Receive alerts when campaigns are close to budget limits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}
