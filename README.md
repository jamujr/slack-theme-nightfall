# slack-theme-nightfall
an osx slack app theme

## Custom Sidebar Theme Colors
```
#323232,#3b4048,#555a63,#ffffff,#292d33,#FFFFFF,#3dd983,#EB4D5C
```

## Steps to use with the OSX Slack App
1. Update your Sidebar custom colors with the values from above.
2. Replace your ssb-interop.js file with the one provided in this repo.
3. Restart the app; enjoy!


### Notes
* macOS `Applications/Slack.app/Contents/Resources/app.asar.unpacked/src/static/ssb-interop.js`
  * (To open Slack.app, right click on Slack app icon and click on `Show Package Contents`)
* Fonts Used:
    * Nunito
    * Source Code Pro
* To fix light title bar on Mojave use the following cmd and then restart slack:
```
defaults write -app Slack NSRequiresAquaSystemAppearance -bool No
```
