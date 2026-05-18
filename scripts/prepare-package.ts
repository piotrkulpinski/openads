import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises"
import * as path from "node:path"
import process from "node:process"

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  exports?: Record<string, unknown>
  files?: Array<string>
  peerDependencies?: Record<string, string>
  publishConfig?: Record<string, unknown>
  scripts?: Record<string, string>
  [key: string]: unknown
}

const stripSourcePrefix = (value: string): string => {
  return value.replace(/^\.\/src\//, "./")
}

const withExtension = (value: string, extension: string): string => {
  if (value.endsWith("/*")) {
    return `${value}.${extension}`
  }

  if (value.includes("*")) {
    return value.replace(/\*\.tsx?$/, `*.${extension}`).replace(/\*$/, `*.${extension}`)
  }

  if (/\.tsx?$/.test(value)) {
    if (extension === "d.ts") {
      return value.replace(/\.tsx?$/, ".d.ts")
    }

    return value.replace(/\.tsx?$/, `.${extension}`)
  }

  return value
}

const resolveWorkspaceDependencies = async (
  dependencies: Record<string, string> | undefined,
  packageDirectory: string,
): Promise<Record<string, string> | undefined> => {
  if (!dependencies) {
    return
  }

  const resolved: Record<string, string> = {}

  for (const [name, version] of Object.entries(dependencies)) {
    if (version === "workspace:*" || version.startsWith("workspace:")) {
      const packageName = name.replace("@openads/", "")
      const workspacePackagePath = path.join(packageDirectory, "..", packageName, "package.json")

      try {
        const workspacePackage = JSON.parse(
          await readFile(workspacePackagePath, "utf8"),
        ) as PackageJson
        resolved[name] = String(workspacePackage.version)
      } catch {
        resolved[name] = version
      }

      continue
    }

    resolved[name] = version
  }

  return resolved
}

const toDistExport = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value
  }

  const normalized = stripSourcePrefix(value)

  if (normalized.endsWith(".css")) {
    return normalized.replace(/^\.\/dist\//, "./")
  }

  return {
    types: withExtension(normalized, "d.ts"),
    import: withExtension(normalized, "js"),
  }
}

const main = async (): Promise<void> => {
  const packageDirectory = path.resolve(process.argv[2] ?? ".")
  const packagePath = path.join(packageDirectory, "package.json")
  const rawPackage = await readFile(packagePath, "utf8")
  const packageJson = JSON.parse(rawPackage) as PackageJson

  const distDirectory = path.join(packageDirectory, "dist")
  await mkdir(distDirectory, { recursive: true })

  const distExports = Object.fromEntries(
    Object.entries(packageJson.exports ?? {}).map(([key, value]) => {
      return [key, toDistExport(value)]
    }),
  )

  const publishConfig: Record<string, unknown> = packageJson.publishConfig
    ? { ...packageJson.publishConfig }
    : {}
  delete publishConfig.directory

  const resolvedDependencies = await resolveWorkspaceDependencies(
    packageJson.dependencies,
    packageDirectory,
  )
  const resolvedPeerDependencies = await resolveWorkspaceDependencies(
    packageJson.peerDependencies,
    packageDirectory,
  )

  const basePackage: Record<string, unknown> = { ...packageJson }

  delete basePackage.files
  delete basePackage.scripts
  delete basePackage.devDependencies

  const distPackage: Record<string, unknown> = {
    ...basePackage,
    main: "./index.js",
    module: "./index.js",
    types: "./index.d.ts",
    exports: distExports,
    dependencies: resolvedDependencies,
    peerDependencies: resolvedPeerDependencies,
    publishConfig: Object.keys(publishConfig).length ? publishConfig : undefined,
  }

  if (distPackage.publishConfig === undefined) {
    delete distPackage.publishConfig
  }
  const distPackagePath = path.join(distDirectory, "package.json")
  await writeFile(distPackagePath, `${JSON.stringify(distPackage, null, 2)}\n`, "utf8")

  for (const fileName of ["README.md", "LICENSE"]) {
    const sourcePath = path.join(packageDirectory, fileName)

    try {
      await copyFile(sourcePath, path.join(distDirectory, fileName))
    } catch {
      // Package readmes and licenses are optional in this monorepo.
    }
  }

  process.stdout.write(`[prepare-package] wrote ${path.relative(process.cwd(), distPackagePath)}\n`)
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  )
  process.exitCode = 1
})
