var extend 			= require('node.extend');
var StatefulObject 	= require('./StatefulObject');

var Song = function(config) {
	StatefulObject.call(this);
	extend(this, config);
};

Song.prototype = extend(new StatefulObject(), {
	Title: "No Title",
	elements: null,
	startingElement: 'intro',
	onNote: function(note, timestamp) {
		if (!this.state.currentElement) {
			this.state.currentElementTitle = this.startingElement;
			this.state.currentElement = this.elements[this.state.currentElementTitle];
		} else {
			if (this.state.currentElement.complete) {
				this.state.currentElement.resetState();
				if(this.state.currentElement.nextElement instanceof Array) {
					if (this.state.currentElement.timesPlayed == undefined) {
						this.state.currentElement.timesPlayed = 0
					} else {
						this.state.currentElement.timesPlayed ++;
					}
					//This element will be played again, so reset the complete property
					this.state.currentElement.complete = false;
					this.state.currentElementTitle = this.state.currentElement.nextElement[this.state.currentElement.timesPlayed];
				} else if (this.state.currentElement.nextElement){
					this.state.currentElementTitle = this.state.currentElement.nextElement;
				} else {
					this.resetState();
					return;
				}

				this.state.currentElement = this.elements[this.state.currentElementTitle];
			}
		}

		this.elements[this.state.currentElementTitle].onNote(note, timestamp);
	},
	resetState: function() {
		this.state = {};
		for (var element in this.elements) {
			var currentElement = this.elements[element];
			currentElement.resetState();
			currentElement.start.resetState();

			if (currentElement.middle) {
				for (var i = 0; i < currentElement.middle; i++) {
					currentElement.middle[i].resetState();
				}
			}

			currentElement.end.resetState();
		}
	}
});

module.exports = Song;
