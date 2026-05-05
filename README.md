# 🥗 BiteBook

Daily Food Log web app. 
Made using Claude code to port the Grok AI's app to a react web app.

# Getting started
```
npm install
npm run preview
```
## Open URL
http://localhost:3000

# Post install - one time setup - for running the app on startup
## Install global packages
```
npm install -g serve
npm install -g pm2
```
## Build the app
```
npm run build
```

## Test the app
```
serve dist 3000
```
## Open URL
http://localhost:3000

## Kill the app after verifying it is working properly 
```
Ctrl + C
```
## Setup the app to run on startup
```
pm2 serve dist 3000
pm2 save
pm2 startup
```
Follow the instructions for startup, run the command in the terminal
Now the app will always be up and running even after system reboots

## To remove from startup
```
pm2 unstartup
```
Follow the instructions for removing from / unstartup, run the command in the terminal


