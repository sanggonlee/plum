# plum

[![GitHub release](https://img.shields.io/github/release/sanggonlee/plum.svg?include_prereleases)](https://GitHub.com/sanggonlee/plum/releases?include_prereleases)
![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/sanggonlee/plum?style=plastic)
[![CodeFactor](https://www.codefactor.io/repository/github/sanggonlee/plum/badge)](https://www.codefactor.io/repository/github/sanggonlee/plum)
[![made-with-Go](https://img.shields.io/badge/Made%20with-Go-1f425f.svg)](http://golang.org)
[![GoReportCard example](https://goreportcard.com/badge/github.com/sanggonlee/plum)](https://goreportcard.com/report/github.com/sanggonlee/plum)

plum is a lightweight tool for investigating and exploring lock contention or deadlock in PostgreSQL.

Primarily supported by two libraries:
* [pogo](https://github.com/sanggonlee/pogo) (for backend querying)
* [monochron](https://github.com/sanggonlee/monochron) (for React realtime chart)

## What's with the name?

Several years ago, I was helping my friend learn coding for the first time. He was coding something like hello world in Java, and I was watching him do it. I noticed he named a Scanner variable as "plum", like this:
```java
Scanner plum = new Scanner(System.in);
```

Me: Why did you name this variable plum?

Him: I like plums.

He likes making jokes, but this time he wasn't joking. I found this very entertaining, so that's how the name of this project came to be. If you prefer a more boring version, you can remember it as "Postgres Locks Uner Monitoring" or something (I made that out of "plum", honestly).

## Features

* Actively monitor the PostgreSQL processes and the locks they're holding in realtime.
![Screenshot-1](/screenshots/1.gif)

* Record and replay the monitored session.
* Drill down into a specific moment to gain insight of the locks held at that moment.
![Screenshot-2](/screenshots/2.png)
* Control interval for realtime update, which tables to monitor, etc.
![Screenshot-3](/screenshots/3.png)

## Instructions

1. Configure your env.sh: Copy `env.sh.example` in the root directory to `env.sh`, and tweak the variables to fit your environment.
2. Run `make run-server` to run the plum server.
3. (first time only) In another console, change directory to `ui` and run `npm run install`.
4. Back to the root directory, run `make run-ui`.
5. The UI should start up at `localhost:3399`.

[Instructions for the usage](https://lee-sg16.medium.com/use-plum-to-dig-through-postgresql-lock-contention-a6753d6e73b7)

## Caveats
1. The statistics data might not reflect the most up-to-date state, because it doesn't include the queries or transactions still in progress.
2. Depending on the permissions of the Postgres user you're using for plum, you might see some null values if the user doesn't have enough permissions.
