/* eslint-disable @typescript-eslint/no-explicit-any */

import path from 'path'
import { createJiti } from 'jiti'

type Jiti = ReturnType<typeof createJiti>
type JitiOptions = Parameters<typeof createJiti>[1]
type LoaderAsync = (filepath: string) => Promise<any>

class TypeScriptCompileError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name

    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, new.target.prototype)
  }

  public static fromError(error: Error): TypeScriptCompileError {
    const message = `TypeScriptLoader failed to compile TypeScript:\n${error.message}`

    const newError = new TypeScriptCompileError(message)
    newError.stack = error.stack

    return newError
  }
}

function TypeScriptLoader(options?: JitiOptions): LoaderAsync {
  const loader: Jiti = createJiti('', { interopDefault: true, ...options })
  return async (path: string): Promise<any> => {
    try {
      const mod = (await loader.import(path)) as { default?: unknown }
      return mod.default || mod
    } catch (error) {
      if (error instanceof Error) {
        // Coerce generic error instance into typed error with better logging.
        throw TypeScriptCompileError.fromError(error)
      }
      throw error
    }
  }
}

export async function loadScript<T = any>(filePath: string): Promise<T> {
  if (['.js', '.mjs', '.cjs'].includes(path.extname(filePath))) {
    const mod = require(filePath) // eslint-disable-line @typescript-eslint/no-require-imports
    return (mod.default || mod) as T
  }
  return TypeScriptLoader()(filePath) as T
}
