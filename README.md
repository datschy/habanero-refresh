# Habanero Refresh
Starts a web browser instance and automatically refreshes the window on code changes. Basically a glorified glue script between Selenium and chokidar.

Since *Habanero Refresh* uses Selenium, you'll have to have the appropriate *WebDriver* for your browser in your `PATH`.

## Configuration

### Default
```
export default {
    browser: 'chrome',
    url: 'http://localhost:8080',
    watchFolders: ['./'],
    watchFileExtensions: ['html', 'css', 'js', 'twig', 'jinja', 'php', 'py'],
    ignored: ['node_modules', '.git'],
    debug: false
}
```
### Custom
To customize the configuration, just create a file with the name *habanero-refresh.conf.mjs* in your working directory. For example to use Firefox instead of Chrome, you just need:
```
export default {
    browser: 'firefox'
}
```
All settings not mentioned in your configuration file, will keep their default values.