import { spawn } from 'child_process'
import { readdir } from 'fs/promises'
import { basename, resolve } from 'path'

const workspaces = ['services']

const run = async () => {
  const args = process.argv.slice(2)
  const bin = resolve(
    process.cwd(),
    './node_modules/.bin',
    process.platform === 'win32' ? 'tsc-watch.cmd' : 'tsc-watch'
  )

  const packages = await getPackages()

  for (const pkg of packages) {
    const name = basename(pkg)

    const proc = spawn(bin, args, {
      shell: true,
      cwd: pkg
    })

    proc.stderr.on('data', (chunk) => {
      console.error(`[error] ${name}:`, chunk.toString('utf8').trim())
    })

    proc.stdout.on('data', (chunk) => {
      console.log(`[data] ${name}:`, chunk.toString('utf8').trim())
    })

    proc
      .on('error', (err) => {
        console.error(`[error] ${name}:`, err)
      })
      .on('exit', (code) => {
        console.log(`[exit ${code}] ${name}`)
      })
  }
}

run()
  .then(() => {
    console.log('done')
  })
  .catch((error) => {
    console.error('error:', error)
    process.exit(1)
  })

async function getPackages(): Promise<string[]> {
  const packages: string[] = []

  for (const workspace of workspaces) {
    const baseDir = resolve(process.cwd(), workspace)
    const items = await readdir(baseDir, {
      encoding: 'utf8',
      withFileTypes: true
    })

    for (const item of items) {
      if (!item.isDirectory()) {
        continue
      }

      packages.push(resolve(baseDir, item.name))
    }
  }

  return packages
}
