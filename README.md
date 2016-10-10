# d8-ember

Quick harness to get a basic ember-app rendering and running in d8 (v8 console, no browser, no node etc.etc.)

## How to use:

```sh
cd my-app; npm install; bower install
/path/to/d8 d8-my-app.js // <-- app runs, and prints out rendered to STDOUT + some fugly logging + 1 error..
```


### Goals:

* remove all the hacks required to get this working
* get some common scenarios in-place to explore
