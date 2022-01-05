<script>
	import Snap from 'snapsvg';
	import Paper from 'snapsvg';
	import { onMount } from 'svelte';
	import DiagramDataStore from './DiagramDataStore';

	let diagramdata = {};

	/* Diagram level vars */
	const topMarginY = 30;
	const actorToMessagePadding = 50;

	/* Actor vars */
	const actorInnerPaddingX = 10;
	const actorOuterPaddingX = 120;
	const actorInnerPaddingY = 10;
	var actorXOffset = 20;
	var actorBBoxArray = [];
	var execBBoxArray = [];

	/* Exec vars */
	const execStepHeight = 50;
	const execWidth = 20;

	/* Label vars */
	const labelYOffset = -4;

	/* Get data model from store */
	DiagramDataStore.subscribe(data => {diagramdata=data});

	onMount( () => {
		var s = Snap("#snap");

		/* Draw actors */
		diagramdata.actors.forEach(actor => {
			var xposActor = actorXOffset;

			var actorLabel = s.text(xposActor, topMarginY, actor.label);
			var actorLabelBBox = actorLabel.getBBox();

			actorLabel.attr({
          		'text-anchor':'start'
      		});

			var actorBox = s.rect(actorLabelBBox.x - actorInnerPaddingX, 
									actorLabelBBox.y - actorInnerPaddingY,
									actorLabelBBox.width + (2 * actorInnerPaddingX),
									actorLabelBBox.height + (2 * actorInnerPaddingY));

			actorBox.attr({
    			fill: "#bada55",
    			stroke: "#000",
    			strokeWidth: 3
			});

			/* 'before' will make the box draw first to push it to background   */
			actorLabel.before(actorBox);

			/* Draw lifeline */
			var actorBoxBBox = actorBox.getBBox();
			var lifeline = s.paper.line(actorBoxBBox.cx, actorBoxBBox.y2, actorBoxBBox.cx, 450);
			lifeline.attr(
							{
								stroke: "#000000",
								strokeDasharray: "4"
							}
						);

			/* Save actor bounding boxes */
			actorBBoxArray.push({"actorid": actor.id, "boundingBox":actorBoxBBox});

			/* Update X for next loop */
			actorXOffset += (actorLabelBBox.width + actorOuterPaddingX); 

		});

		/* Calculate execution rects */
		var inFlightCalls = [];
		var execRects = [];
		var messageCnt = 0;

		if (diagramdata.messages.length > 0) {
			inFlightCalls.push({"actorid":diagramdata.messages[0].source, "start":0, "end":diagramdata.messages.length + 1});
		}

		diagramdata.messages.forEach(message => {

			if (message.type === 'invocation') {
				inFlightCalls.push({message: message, start:messageCnt});
			} else if (message.type === 'return') {
				var completedCall = inFlightCalls.pop();
				execRects.push({"actorid":message.source, "start":completedCall.start, "end":messageCnt})
			}

			messageCnt++;
		});

		/* Process any remaining inflight calls and make them continuous execs */
		inFlightCalls.forEach(inflight => {
			execRects.push({"actorid":inflight.actorid, "start":inflight.start, "end":messageCnt});
		});

		/* Draw execution rects */
		execRects.forEach(rect => {

			/* Find bounding box for actor */
			var actorBoxBBox = actorBBoxArray.find(actor => actor.actorid === rect.actorid);

			var execRect = s.rect(actorBoxBBox.boundingBox.cx - (execWidth / 2),
					actorBoxBBox.boundingBox.y2 + (rect.start * execStepHeight) + actorToMessagePadding,
					execWidth,
					(rect.end - rect.start) * execStepHeight);

			execRect.attr({
    			fill: "#fcf3cf",
    			stroke: "#000",
    			strokeWidth: 1
			});

			execBBoxArray.push({"actorid":rect.actorid, "boundingBox":execRect.getBBox()})
		});

		/* Draw messages */
		diagramdata.messages.forEach(message => {

			/* Find bounding box for source/target actors */
			var execSourceBBox = execBBoxArray.find(actor => actor.actorid === message.source);
			var execTargetBBox = execBBoxArray.find(actor => actor.actorid === message.target);

			/* Find indexes to derive message direction */
			var execSourceIndex = diagramdata.actors.findIndex(actor => actor.id === message.source);
			var execTargetIndex = diagramdata.actors.findIndex(actor => actor.id === message.target);

			/* Calc message graphical properties */
			var msgStartX = 0;
			var msgEndX = 0;
			var msgDirection = "";

			if (execSourceIndex < execTargetIndex) {
				/* left to right */
				msgDirection = "leftToRight";
				msgStartX = execSourceBBox.boundingBox.x2;
				msgEndX = execTargetBBox.boundingBox.x;
			} else {
				/* right to left */
				msgDirection = "rightToLeft";
				msgStartX = execSourceBBox.boundingBox.x;
				msgEndX = execTargetBBox.boundingBox.x2;
			}

			var lineStyle = (message.type === 'invocation' ? '0' : '4');
			var msgY = (message.type === 'invocation' ? execTargetBBox.boundingBox.y : execSourceBBox.boundingBox.y2);

			/* Draw message */
			var messageLine = s.paper.line(msgStartX, msgY, msgEndX, msgY);

			var arrow = s.paper.polygon([0,20, 8,20, 4,0, 0,20]).attr({fill: '#000'}).transform('r90');
			var marker = arrow.marker(0,0, 10,10, 10,10);

			messageLine.attr(
							{
								stroke: "#000000",
								strokeDasharray: lineStyle,
								markerEnd: marker
							}
						);

			var messageLineBBox = messageLine.getBBox();
			var labelText = s.text(messageLineBBox.cx, messageLineBBox.cy + labelYOffset, message.label);

			labelText.attr({
				fontSize:"11px",
				fontFamily:"Courier New"
			});

			/* Center label above line */
			var labelTextBBox = labelText.getBBox();
			var labelShiftX = -(labelTextBBox.width / 2);
			labelText.transform("translate(" + labelShiftX + ",0)");

			messageCnt++;
		});


	} );

</script>

<main>
	<h3>OAuth 2.0 - Sequence Diagram</h3>
	<h5>Proof Of Concept</h5>
	<svg id="snap" width="700" height="500"></svg>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>