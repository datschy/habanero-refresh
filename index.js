#! /usr/bin/env node

import { Builder } from "selenium-webdriver"
import { Options } from "selenium-webdriver/chrome.js"
import chokidar from 'chokidar'
import chalk from 'chalk'

function logInfo(message) {
    console.info(`[INFO] ${message}`)
}

function logWarn(message) {
    console.warn(chalk.yellow(`[WARN] ${message}`))
}

function logError(message) {
    console.error(chalk.red(`[ERROR] ${message}`))
}

function logSuccess(message) {
    console.info(chalk.green(`[SUCCESS] ${message}`))
}

function logDebug(message) {
    console.log(chalk.magenta(`[DEBUG] ${message}`))
}

function buildWatchPaths(config) {
    const watchPaths = config.watchFolders
        .flatMap(wf => config.watchFileExtensions.map(ext => `${wf}/**/*.${ext}`))
        .map(e => e.replace('//', '/'))
    if (config.debug) {
        logDebug(`Paths to watch:\n${watchPaths.join('\n')}`)
    }
    return watchPaths
}

logInfo('Starting Habanero Refresh...')

let conf = {
    browser: 'chrome',
    url: 'http://localhost:8080',
    watchFolders: ['./'],
    watchFileExtensions: ['html', 'css', 'js', 'twig', 'jinja', 'php', 'py'],
    ignored: ['node_modules', '.git'],
    debug: false
}

await import(process.cwd() + '/habanero-refresh.conf.mjs')
    .then((importedConf => conf = {...conf, ...importedConf.default}))
    .catch(() => logInfo('No config provided, loading defaults...'))

if (conf.debug) {
    const configText = Object.entries(conf).map(e => `\n${e[0]}: ${e[1]}`).join('')
    logDebug(`Used configuration:${configText}`)
}

const driver = await new Builder()
    .forBrowser(conf.browser)
    .setChromeOptions(new Options().excludeSwitches('enable-automation'))
    .build()
    .catch((e) => {
        if (conf.debug) {
            console.error(e)
            process.exit(1)
        } else {
            logError(`Could not open browser "${conf.browser}", is a suitable WebDriver in your PATH?`)
            process.exit(1)
        }
    })
await driver.navigate().to(conf.url).catch(() => {
        logWarn(`Could not open URL "${conf.url}"...`)
})

const fileWatcher = chokidar.watch(buildWatchPaths(conf))
fileWatcher.on('change', () => driver.navigate().refresh())

const interval = setInterval(() => {
    driver.getAllWindowHandles().catch(() => {
        logInfo("Exiting Habanero Refresh...")
        fileWatcher.close()
        clearInterval(interval)
    })}, 1000)

logSuccess('Habanero Refresh is up and running, productive coding!')