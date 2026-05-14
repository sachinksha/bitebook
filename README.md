
# 🥗 BiteBook

# Introduction
I made a webapp using various AI agents for logging daily meals.
Grok, Claude, Github copilot, Cursor and vercel.
All these agents have contributed in some ways or the other to build and iterate over the app to enhance the features.

## Users can log three meals per day breakfast lunch and dinner.
1. Provide a short description for the meal.
2. Meal was made at Home or Restaurant or skipped the meal altogether.
3. If ordered from a restaurant (outside food) then assign if it was made by a person or restaurant.
4. If ordered from a restaurant then select if it was a dine-in or a delivery service.
5. Optional - drag and drop from previously logged entries. Because often some items are repeated.

## Data
* Get a template excel file to make data entries.
* Export all the data to excel for saving (I upload this to a private github repository to preserve it).
* Import excel previous data.

## Calendar view

* Get a glance of what was made/consumed in the last 2 weeks.
* This can be scrolled to see older data.

## History view
* See what were the last entries made to the app.
* Last entry is at the top.
* You can edit and correct any records here.

## Insights

* See what was the most repeated dish
* Get suggestion on what to make next since its been long that dish was made*
* Compare stats on home cooked vs food ordered from outside
* See graph for what are the most frequently repeated dishes
* See graph for who cooks the most

# Development - Getting started

```
npm install
```
then for dev server
```
npm run dev
```
or for local deployment
```
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
## Build the app - for prod build - to the 'dist' folder
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

#  Vercel integration
This project is set to automatically deploy the main branch on updates.

Checkout the output on https://bitebook-six.vercel.app/

It also has build in analytics configured