/*
Copyright 2017 olvsky21

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var version = 1;
var chunks = 2;
var chunkIndex = 0;
var inputFile = "";
var outputPath = "./temp";
var outputName = "";
var commands = [
		{
			description: "Display help.", 
			inputs: ["--help", "-h", "/?"], 
			func: displayHelp
		}, 
		{
			description: "The input file.", 
			inputs: ["--input", "-i", "/i"], 
			func: function (value)
				{
					inputFile = value;
				}
		}, 
		{
			description: "The output directory path.", 
			inputs: ["--output-dir", "-o", "/o"], 
			func: function (value)
				{
					outputPath = value;
				}
		}, 
		{
			description: "Change the output file name.", 
			inputs: ["--output-name", "-n", "/n"], 
			func: function (value)
				{
					outputName = value;
				}
		}, 
		{
			description: "Number of chunks to split the file into.", 
			inputs: ["--chunks", "-c", "/c"], 
			acceptsValue: true, 
			func: function (value)
				{
					if (isNaN (value) == true)
					{
						console.log ("Chunks argument must be an integer.");

						return;
					}

					chunks = parseInt (value);
				}
		}
	];

function displayHelp() {
	console.log ("Split text files");
	console.log ("Version " + version);
	console.log ("");
 
	for (var i = 0; i < commands.length; i++)
	{
		var command = commands[i];
		var output = "";

		for (var j = 0; j < command.inputs.length; j++)
			output += command.inputs[j] + " ";

		output += command.description;
		console.log (output);
	}

	process.exit ();
}

function processArg(arg, nextArg) {
	for (var i = 0; i < commands.length; i++)
	{
		var command = commands[i];
		var foundInput = false;

		for (var j = 0; j < command.inputs.length; j++)
		{
			var input = command.inputs[j];

			if (arg == input)
			{
				if (command.acceptsValue != null)
				{
					if (command.acceptsValue == true)
					{
						if (nextArg == null)
						{
							console.log ("Argument " + arg + " value is missing!");

							return;
						}
					}

					command.func (nextArg);
				}
				else
					command.func (nextArg);

				foundInput = true;
			}
		}

		if (foundInput == false)
			inputFile = arg;
	}
}

for (var i = 0; i < process.argv.length; i++)
{
	var arg = process.argv[i];
	var nextArg = process.argv[i + 1];

	processArg (arg, nextArg);
}

var fs = require ("fs");

if(outputName == "")
{
	var begin = inputFile.lastIndexOf ("/");
	var tempName = "";

	if(begin < 0)
		begin = inputFile.lastIndexOf ("\\");

	if(begin >= 0)
		tempName = inputFile.substr (begin + 1);
	else
		tempName = inputFile;

	outputName = tempName;
}

if(fs.existsSync (outputPath + "/") == false)
{
	console.log ("mkdir");
	fs.mkdirSync (outputPath + "/");
}

var currentFile = "";
var currentFileSize = 0;
var totalSize = 0;

console.log ("Opening file " + inputFile);
var stats = fs.statSync(inputFile);
var stream = fs.createReadStream (inputFile, { autoClose: true });
stream.on ("data", function (chunk){
		currentFile += chunk.toString ();
		currentFileSize += chunk.length;
		totalSize += chunk.length;

		if((currentFileSize >= parseInt (stats.size / chunks)) || 
			(totalSize >= parseInt (stats.size)))
		{
			var index = outputName.lastIndexOf(".");
			var tempName = outputName;
			var ext = "";

			if(index > 0)
			{
				tempName = outputName.substr (0, index);
				ext = outputName.substr (index + 1);
			}

			if (ext != "")
				ext = "." + ext;

			var path = outputPath + "/" + tempName + chunkIndex + ext;
			console.log ("Writing to file " + path);
			fs.writeFileSync (path, currentFile);

			currentFile = "";
			currentFileSize = 0;
			chunkIndex++;
		}
	});

