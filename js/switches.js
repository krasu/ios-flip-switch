(function($) {
	var iOSFlipSwitch = function(el, options) {
		this.input = el
		this.state = {}
		this.options = $.extend({
			containerClass: 'ios-switch-container',
			handleClass: 'switcher',
			duration: 200
		}, options);

		this.init()

		return {
			reset: $.proxy(this.calcMetrics, this)
		}
	}

	iOSFlipSwitch.prototype.init = function() {
		this.container = $('<div>').addClass(this.options.containerClass);
		this.on = $('<div class="on">');
		this.off = $('<div class="off">');
		this.handle = $('<div>').addClass(this.options.handleClass);

		this.container.append([this.on, this.handle, this.off])

		this.container.insertAfter(this.input)
		this.container.prepend(this.input)

		this.calcMetrics()

		this.container.on('mousedown touchstart', $.proxy(this.onDragStart, this));
		this.input.on('change', $.proxy(this.handleChange, this));
		this.setPositions(false, false)
	}

	iOSFlipSwitch.prototype.calcMetrics = function() {
		if (this.metrics && this.metrics.containerWidth) return

		this.metrics = {
			containerWidth: this.container.outerWidth(),
			handleWidth: this.handle.outerWidth()
		}

		this.metrics.maxX = this.metrics.containerWidth - this.metrics.handleWidth;
	}

	iOSFlipSwitch.prototype.handleChange = function() {
		this.setPositions(false, true)
	}

	iOSFlipSwitch.prototype.setPositions = function(x, animate) {
		if (x === false) {
			x = this.input.prop('checked') ? this.metrics.maxX : 0
		}
		if (x < -1) x = -1
		if (x > this.metrics.maxX) x = this.metrics.maxX

		var onX = (x - this.metrics.containerWidth) + this.metrics.handleWidth,
			duration = animate ? this.options.duration : 0;

		this.handle.animate({
			left: x
		}, duration);
		this.off.animate({
			left: x
		}, duration);
		this.on.animate({
			left: onX
		}, duration)
	}

	iOSFlipSwitch.prototype.getActualX = function(event) {
		if (event.pageX) return event.pageX
		if (event.originalEvent.changedTouches) return event.originalEvent.changedTouches[0].pageX
		return 0
	}

	iOSFlipSwitch.prototype.onDragEnd = function(event) {
		$(document).off('mousemove touchmove', $.proxy(this.onDrag, this));
		$(document).off('mouseup touchend', $.proxy(this.onDragEnd, this));

		if (!this.state.currentlyClicking) return;
		event.preventDefault();

		var checked
		if (this.state.dragging) {
			var p = (this.getActualX(event) - this.state.dragStartPosition) / this.metrics.maxX
			checked = p >= 0.5;
		} else {
			checked = !this.input.prop('checked');
		}

		this.input.prop('checked', checked);
		this.state.currentlyClicking = null;
		this.state.dragging = null;
		this.setPositions(false, true)
	}

	iOSFlipSwitch.prototype.onDragStart = function(event) {
		event.preventDefault();
		$(document).on('mousemove touchmove', $.proxy(this.onDrag, this));
		$(document).on('mouseup touchend', $.proxy(this.onDragEnd, this));


		this.state.currentlyClicking = this.handle;
		this.state.dragStartPosition = this.getActualX(event);
		this.state.handleLeftOffset = parseInt(this.handle.css('left'), 10) || 0;
	}

	iOSFlipSwitch.prototype.onDrag = function(event) {
		event.preventDefault();
		if (!this.state.currentlyClicking) return;
		var x = this.getActualX(event)

		this.state.dragging = (!this.state.dragging && Math.abs(this.state.dragStartPosition - x))

		this.setPositions(x + this.state.handleLeftOffset - this.state.dragStartPosition);
	}

	$.fn.iOSFlipSwitch = function(options) {
		return $(this).each(function(i, el) {
			new iOSFlipSwitch($(el), options)
		})
	}

})(jQuery);