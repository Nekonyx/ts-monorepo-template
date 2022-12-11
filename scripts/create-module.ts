import { mkdir, readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'

const packageJsonTemplate = serializeJSON({
  name: '<name>',
  version: '0.0.0',
  private: true,
  main: './build/index.js',
  types: './src/index.ts',
  dependencies: {},
  devDependencies: {}
})

const tsConfigTemplate = serializeJSON({
  extends: '../../tsconfig.json',
  compilerOptions: {
    outDir: 'build',
    noEmit: false
  },
  include: ['src']
})

const run = async () => {
  const [type, name] = process.argv.slice(2)

  if (!type || !name) {
    console.error('Usage: pnpm create-module <type> <name>')
    process.exit(7)
  }

  const projectName = await getProjectName()
  const baseDir = resolve(process.cwd(), type, name)
  const srcDir = resolve(baseDir, 'src')

  console.log(`creating folder ${srcDir}...`)
  await mkdir(srcDir, {
    recursive: true
  })

  console.log('creating package.json')
  await writeFile(
    resolve(baseDir, 'package.json'),
    packageJsonTemplate.replace('<name>', `@${projectName}/${name}`)
  )

  console.log('creating tsconfig.json')
  await writeFile(resolve(baseDir, 'tsconfig.json'), tsConfigTemplate)
}

run()
  .then(() => {
    console.log('done')
  })
  .catch((error) => {
    console.error('error:', error)
    process.exit(1)
  })

async function getProjectName(): Promise<string> {
  const content = await readFile(resolve(process.cwd(), 'package.json'), 'utf8')
  const json = JSON.parse(content)

  return json.name
}

function serializeJSON(object: any): string {
  const json = JSON.stringify(object, null, 2)

  // newline at end of file
  return json + '\n'
}
