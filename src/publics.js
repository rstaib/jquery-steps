/**
 * Represents a jQuery wizard plugin.
 *
 * @class steps
 * @constructor
 * @param [method={}] The name of the method as `String` or an JSON object for initialization
 * @param [params=]* {Array} Additional arguments for a method call
 * @chainable
 **/
$.fn.steps = function (method)
{
    if ($.fn.steps[method])
    {
        return $.fn.steps[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else if (typeof method === "object" || !method)
    {
        return privates.initialize.apply(this, arguments);
    }
    else
    {
        $.error("Method " + method + " does not exist on jQuery.steps");
    }
};

/**
 * Adds a new step.
 *
 * @method add
 * @param step {Object} The step object to add
 * @chainable
 **/
$.fn.steps.add = function (step)
{
    return this.steps("insert", this.data("state").stepCount, step);
};

/**
 * Triggers the onFinishing and onFinished event.
 *
 * @method finish
 **/
$.fn.steps.finish = function ()
{
    var options = this.data("options"),
        state = this.data("state"),
        currentStep = this.find(".steps li").eq(state.currentIndex);

    if (this.triggerHandler("finishing", [state.currentIndex]))
    {
        currentStep.addClass("done").removeClass("error");
        this.triggerHandler("finished", [state.currentIndex]);
    }
    else
    {
        currentStep.addClass("error");
    }
};

/**
 * Gets the current step index.
 *
 * @method getCurrentIndex
 * @return {Integer} The actual step index (zero-based)
 * @for steps
 **/
$.fn.steps.getCurrentIndex = function ()
{
    return this.data("state").currentIndex;
};

/**
 * Gets the current step object.
 *
 * @method getCurrentStep
 * @return {Object} The actual step object
 **/
$.fn.steps.getCurrentStep = function ()
{
    return privates.getStep(this, this.data("state").currentIndex);
};

/**
 * Gets a specific step object by index.
 *
 * @method getStep
 * @param index {Integer} An integer that belongs to the position of a step
 * @return {Object} A specific step object
 **/
$.fn.steps.getStep = function (index)
{
    return privates.getStep(this, index);
};

/**
 * Inserts a new step to a specific position.
 *
 * @method insert
 * @param index {Integer} The position (zero-based) to add
 * @param step {Object} The step object to add
 * @example
 *     $("#wizard").steps().insert(0, {
 *         title: "Title",
 *         content: "", // optional
 *         contentMode: "async", // optional
 *         contentUrl: "/Content/Step/1" // optional
 *     });
 * @chainable
 **/
$.fn.steps.insert = function (index, step)
{
    var uniqueId = privates.getUniqueId(this),
        options = this.data("options"),
        state = this.data("state");

    if (index < 0 || index > state.stepCount)
    {
        throw new Error("Index out of range.");
    }

    // TODO: Validate step object

    // Change data
    step = $.extend({}, $.fn.steps.stepModel, step);
    privates.insertStep(this, index, step);
    if (state.currentIndex >= index)
    {
        state.currentIndex++;
        privates.saveCurrentStateToCookie(this, options, state);
    }
    state.stepCount++;

    var contentContainer = this.find(".content"),
        header = $(document.createElement(options.headerTag)).html(step.title),
        body = $(document.createElement(options.bodyTag));

    if (step.contentMode == null || step.contentMode === $.fn.steps.contentMode.html)
    {
        body.html(step.content);
    }

    if (index === 0)
    {
        contentContainer.prepend(body).prepend(header);
    }
    else
    {
        contentContainer.find("#" + uniqueId + _tabpanelSuffix + (index - 1)).after(body).after(header);
    }

    privates.renderBody(this, body, index);
    privates.renderTitle(this, options, state, header, index);
    privates.refreshSteps(this, options, state, index);
    privates.refreshPagination(this, options, state);

    return this;
};

/**
 * Routes to the next step.
 *
 * @method next
 * @return {Boolean} Indicates whether the action executed
 **/
$.fn.steps.next = function ()
{
    return privates.paginationClick(this, this.data("state").currentIndex + 1);
};

/**
 * Routes to the previous step.
 *
 * @method previous
 * @return {Boolean} Indicates whether the action executed
 **/
$.fn.steps.previous = function ()
{
    return privates.paginationClick(this, this.data("state").currentIndex - 1);
};

/**
 * Removes a specific step by an given index.
 *
 * @method remove
 * @param index {Integer} The position (zero-based) of the step to remove
 * @return Indecates whether the item is removed.
 **/
$.fn.steps.remove = function (index)
{
    var uniqueId = privates.getUniqueId(this),
        options = this.data("options"),
        state = this.data("state");

    // Index out of range and try deleting current item will return false.
    if (index < 0 || index >= state.stepCount || state.currentIndex === index)
    {
        return false;
    }

    // Change data
    privates.removeStep(this, index);
    if (state.currentIndex > index)
    {
        state.currentIndex--;
        privates.saveCurrentStateToCookie(this, options, state);
    }
    state.stepCount--;

    this.find("#" + uniqueId + _titleSuffix + index).remove();
    this.find("#" + uniqueId + _tabpanelSuffix + index).remove();
    this.find("#" + uniqueId + _tabSuffix + index).parent().remove();

    // Set the "first" class to the new first step button 
    if (index === 0)
    {
        this.find(".steps li").first().addClass("first");
    }

    // Set the "last" class to the new last step button 
    if (index === state.stepCount)
    {
        this.find(".steps li").eq(index).addClass("last");
    }

    privates.refreshSteps(this, options, state, index);
    privates.refreshPagination(this, options, state);

    return true;
};

/**
 * Sets a specific step object by index.
 *
 * @method setStep
 * @param index {Integer} An integer that belongs to the position of a step
 * @param step {Object} The step object to change
 **/
$.fn.steps.setStep = function (index, step)
{
    throw new Error("Not yet implemented!");
};

/**
 * Skips an certain amount of steps.
 *
 * @method skip
 * @param count {Integer} The amount of steps that should be skipped
 * @return {Boolean} Indicates whether the action executed
 **/
$.fn.steps.skip = function (count)
{
    throw new Error("Not yet implemented!");
};