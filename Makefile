default: 
	rm -rf build
	parcel build src/index.pug --dist-dir build/ --no-content-hash --public-url "." --log-level info --detailed-report 10

