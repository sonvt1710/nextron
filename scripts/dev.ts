import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { $ } from 'execa'
import { detectPackageManager } from './detect-package-manager'

await $({ stdio: 'inherit' })`npm run build`

const cwd = process.cwd()

let example = 'basic-lang-javascript'
if (3 <= process.argv.length) {
  const newExample = process.argv[2]
  if (!fs.existsSync(path.join(cwd, `examples/${newExample}`))) {
    console.log(chalk.red(`Not found examples/${newExample}`))
    console.log('')
    process.exit(1)
  }
  example = newExample
}

await fs.remove('workspace')

const ext = fs.existsSync(
  path.resolve(cwd, `examples/${example}/tsconfig.json`)
)
  ? 'ts'
  : 'js'
await fs.copy(
  path.resolve(cwd, `examples/_template/gitignore.txt`),
  path.join(cwd, 'workspace/.gitignore')
)
await fs.copy(
  path.resolve(cwd, `examples/_template/${ext}`),
  path.join(cwd, 'workspace')
)
await fs.copy(
  path.resolve(cwd, `examples/${example}`),
  path.join(cwd, 'workspace')
)

const pkg = path.join(cwd, 'workspace/package.json')
const content = await fs.readJSON(pkg)
content.devDependencies.nextron = cwd
await fs.writeJSON(pkg, { ...content }, { spaces: 2 })

const $$ = $({ cwd: path.join(cwd, 'workspace'), stdio: 'inherit' })
const pm = await detectPackageManager({
  cwd: path.join(cwd, 'workspace'),
})

await $$`${pm} install`

if (pm === 'npm') {
  await $$`${pm} run dev`
} else {
  await $$`${pm} dev`
}
