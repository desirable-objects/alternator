# pdiffy

pdiffy is a perceptual difference tool used to compare images for differences. This tool is primarily aimed at web developement
for comparing different states of a website.

## Getting Started
Install the module with: `npm install pdiffy`

## Documentation
Run `pdiffy server` to start the interface and web server.

You can run a schedule process that creates `sessions` at different intervals.
Screen shots taken get embedded into the session file.
The session can be imported into the interface. pdiffy may need to run with root
permissions depending on where it is installed. PhantomJS writes to a directory where
it is installed and the user would need write permissions.

Run `pdiffy [path]` to run a job based on a config.

Run `pdiffy combine [sessions] -o [output]` to combine multiple session files.

**This does not delete the original session files.**

Run `pdiffy difference [paths | urls] -o [output] -t [threshold] -m [mode]` to perform differences
and output the file. Path can be a URL or path to an image file or any combination of the two.

### Job Options

#### output
The path to the file you want to save to. Make sure node has
permissions to write to this destination. This must have the
extension `.pdiffy` in order for it to be able to be imorted into
the interface.

#### schedule
pdiffy uses [node-schdule](https://github.com/mattpat/node-schedule)
to schedule jobs. This uses the object literal syntax. Please refer to
it's documentation. If the schedule is absent then the job occurs only
once.

#### interval
Interval is similar to schedule except instead of schedule a time it executes every N minutes.
If schedule and interval are present, schedule takes priority.

#### timestamp
Whether to add a timestamp to the filename. This is true by default
when the schedule option is present.

#### options
pdiffy uses [node-webshot](https://github.com/brenden/node-webshot)
to take screen shots. These options are just passed through to node-webshot.

These also can contain an object containing plugins.

- `Object` options.plugins - keys are plugin names and values are a hash of parameters.
                          Refer to the documentation in the plugins folder.
- `String` options.mode - Mode to perform difference if one is being performed.
- `Boolean` options.ignoreColors - Uses brightness to calculate difference other than RGB values.
- `Object` options.tolerance - Object with value tolerances
  * `Number` red - Tolerance for red values
  * `Number` green - Tolerance for green values
  * `Number` blue - Tolerance for blue values
  * `Number` minBrightness - Tolerance for minimum brightness

#### captures
An array of captures. These contain the following parameters:
- `Object` options - Overrides the global options
- `String|Array` url - The url to capture or if an array or urls are passed those pages will
   be captured and a difference will be performed from each of them.

### Using Programmatically
`var pdiffy = require("pdiffy");`

#### Methods
##### startServer()
Starts the server for the interface. Returns with a method `killServer`.

##### capture(config, callback)
- `Object` config - config object
- `Function` callback - callback function

Takes a config schedule object. This will only execute the capture once.
Use `runSchedule()` when wanting to start a schedule.

##### run(config, callback)
- `Object` config - config object
- `Function` callback - callback function

Runs a job based on the config object.

##### combine(sessionPaths, outputPath)
- `Array` sessionPaths - array of session paths
- `String` outputPath - path to write to disk

Combine multiple session files.

##### compare(options)
- `Object` options - config options
  * `Array` paths - Array of paths. Can be a URL or path to a file.
  * `Object` [captureOptions] - Options for capturing URLs.
  * `Object` [diffOptions] - Options for difference processing.
  * `String` [output] - Output path to a file. If no output is
    provided the callback will get passed the data.
  * `Function` [callback] - Function to receive data when an output
    is not provided.

Takes an array of paths and performs a difference on them.

## Examples
Heres an example schedule file (json):
```json
{
  "output": "path/to/session/file.pdiffy",
  "schedule": {
    "minutes": 30
  },
  "options": {
    "shotSize": {
      "width": "all",
      "height": "all"
    },
    "plugins": {
      "hideElements": {
        "selectors": ["#myId"]
      }
    }
  },
  "captures": [
    {
      "options": {},
      "url": "http://google.com"
    }, {
      "options": {
        "tolerance": {
          "red": 50,
          "green": 16,
          "blue": 16
        },
        "mode": "block"
      },
      "url": ["http://cnn.com", "http://msnbc.com"]
    }, {
      "options": {},
      "url": "http://espn.com"
    }
  ] 
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. 
Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) 2013 Steven Sojka. Licensed under the MIT license.`

