
# 🥗 BiteBook

# Introduction
I made a webapp using various AI agents for logging daily meals.
Grok, Claude, Github copilot, Cursor and Vercel.
All these agents have contributed in some ways or the other to build and iterate over the app to enhance the features.

## Users can log three meals per day breakfast lunch and dinner.
1. Provide a short description for the meal.
2. Select if a meal was made at Home or Restaurant or you skipped the meal altogether.
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
* Get suggestion on what to make next since its been long that dish was made
* Compare stats on home cooked vs food ordered from outside
* See graph for what are the most frequently repeated dishes
* See graph for who cooks the most

## Screenshots
<img width="1140" height="947" alt="log" src="https://github.com/user-attachments/assets/c4b9f3d5-9bf3-4e6a-9809-5ffba62863d5" />
<img width="1140" height="947" alt="calendar" src="https://github.com/user-attachments/assets/cf94dbc3-08a2-40af-a8d8-f34a9c37c66a" />
<img width="1140" height="947" alt="history" src="https://github.com/user-attachments/assets/606203d9-ebdd-4fa7-a81d-afcf378f979b" />
<img width="1140" height="947" alt="data" src="https://github.com/user-attachments/assets/dbf0e3c6-c311-419e-842c-b30db8fcd520" />
<img width="1140" height="947" alt="insights" src="https://github.com/user-attachments/assets/87c88038-0ee4-445a-94a6-1721e63fd7cc" />

#  Vercel integration
This project is set to automatically deploy the main branch on updates.

Checkout the output on https://bitebook-six.vercel.app/

It also has build in analytics configured

# Development - Getting started

```
npm install
```
then for dev server deployment to http://localhost:5173
```
npm run dev
```
or for local deployment to http://localhost:4173
```
npm run preview
```
# Post install - one time setup - for running the app on your localmachine on startup (for linux/ubuntu)

## Install global packages
```
npm install -g serve
npm install -g pm2
```
## Build the app - for prod build - to the 'dist' folder
```
npm run build
```
## Test/deploy the app
```
serve dist 3000
```
## Open URL
http://localhost:3000

## Kill the app after verifying it is working properly
```
Ctrl + C
```

## Setup the app to run on startup on http://localhost:3000
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
