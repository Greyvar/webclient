default:
	parcel build index.html -d build/ --no-content-hash --public-url "."

ts:
	tsc js/index.ts --outFile tsCompile.js --module amd
