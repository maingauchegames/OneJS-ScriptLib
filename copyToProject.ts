#!/usr/bin/env npx ts-node
import * as fs from "fs"
import * as path from "path"

if (process.argv.length != 3) {
    console.error(`Usage: node ${__filename} <dstPrefix>`)
    process.exit(1)
}

function stripSuffix(str: string, suffix: string): string {
    if (str.endsWith(suffix)) {
        return str.substring(0, str.length - suffix.length)
    }
    return str
}

const includeSuffixes = [".ts", ".tsx", "tsconfig.json"]

function isCopyable(filepath: string): boolean {
    // We accept the following files:
    // - Any .ts or .tsx file
    // - tsconfig.json
    // - Any .d.ts or .js file if there is no corresponding .ts file

    if (includeSuffixes.some((s) => filepath.endsWith(s))) {
        return true
    }

    if (filepath.endsWith(".d.ts")) {
        const tsPath = stripSuffix(filepath, ".d.ts") + ".ts"
        const tsxPath = stripSuffix(filepath, ".d.ts") + ".tsx"
        return !fs.existsSync(tsPath) && !fs.existsSync(tsxPath)
    }

    if (filepath.endsWith(".js")) {
        const tsPath = stripSuffix(filepath, ".js") + ".ts"
        const tsxPath = stripSuffix(filepath, ".js") + ".tsx"
        return !fs.existsSync(tsPath) && !fs.existsSync(tsxPath)
    }

    return false
}

function visitDir(srcDir: string, dstPrefix: string, ignoreStrings: string[]) {
    for (const basename of fs.readdirSync(srcDir)) {
        const srcPath = path.join(srcDir, basename)
        if (srcPath == __filename) {
            continue
        }

        if (ignoreStrings.some((p) => srcPath.includes(p))) {
            continue
        }

        if (fs.statSync(srcPath).isDirectory()) {
            visitDir(srcPath, path.join(dstPrefix, path.basename(basename)), ignoreStrings)
            continue
        }

        if (!isCopyable(srcPath)) {
            continue
        }

        // Ensure existence of destination dir
        fs.mkdirSync(dstPrefix, { recursive: true })
        const dstPath = path.join(dstPrefix, basename)
        fs.copyFileSync(srcPath, dstPath)
    }
}

const ignoreStrings: string[] = [
    "node_modules",
    "onejs/fonts", // loads json and other assets
    "onejs/comps", // requires fonts
    "3rdparty/classnames", // we have a better-typed version
]

const dstPrefix = stripSuffix(process.argv[2], "/")
console.log("Copying .ts " + dstPrefix)

if (fs.existsSync(dstPrefix)) {
    fs.rmdirSync(dstPrefix, { recursive: true })
}

visitDir(__dirname, dstPrefix, ignoreStrings)
