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

$.fn.steps.extend({
    /**
     * Adds a new step.
     *
     * @method add
     * @param step {Object} The step object to add
     * @chainable
     **/
    add: function (step)
    {
        return this.insert(this.data("state").stepCount, step);
    },

    /**
     * Triggers the onFinishing and onFinished event.
     *
     * @method finish
     **/
    finish: function ()
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
    },

    /**
     * Gets the current step index.
     *
     * @method getCurrentIndex
     * @return {Integer} The actual step index (zero-based)
     * @for steps
     **/
    getCurrentIndex: function ()
    {
        return this.data("state").currentIndex;
    },

    /**
     * Gets the current step object.
     *
     * @method getCurrentStep
     * @return {Object} The actual step object
     **/
    getCurrentStep: function()
    {
        return this.getStep(this.data("state").currentIndex);
    },

    /**
     * Gets a specific step object by index.
     *
     * @method getStep
     * @param index {Integer} An integer that belongs to the position of a step
     * @return {Object} A specific step object
     **/
    getStep: function(index)
    {
        var steps = this.data("steps");

        if (index < 0 || index >= steps.length)
        {
            throw new Error("Index out of range.");
        }

        return steps[index];
    },

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
    insert: function (index, step)
    {
        var uniqueId = getUniqueId(this),
            options = this.data("options"),
            state = this.data("state");

        if (index < 0 || index > state.stepCount)
        {
            throw new Error("Index out of range.");
        }

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

        // Reset state values
        if (state.currentIndex >= index)
        {
            state.currentIndex++;
            privates.saveCurrentStateToCookie(this, options, state);
        }
        state.stepCount++;

        privates.renderBody(this, body, index);
        privates.renderTitle(this, options, state, header, index);

        var currentStepAnchor = this.find("#" + uniqueId + _tabSuffix + index);
        var currentStep = currentStepAnchor.parent();
        if (state.currentIndex > index)
        {
            currentStep.enableAria().addClass("done");
        }

        // Add click event
        currentStepAnchor.bind("click.steps", stepClickHandler);

        privates.refreshSteps(this, options, state, index);
        privates.refreshPagination(this, options, state);

        return this;
    },

    /**
     * Routes to the next step.
     *
     * @method next
     * @return {Boolean} Indicates whether the action executed
     **/
    next: function ()
    {
        return privates.paginationClick(this, this.data("state").currentIndex + 1);
    },

    /**
     * Routes to the previous step.
     *
     * @method previous
     * @return {Boolean} Indicates whether the action executed
     **/
    previous: function ()
    {
        return privates.paginationClick(this, this.data("state").currentIndex - 1);
    },

    /**
     * Removes a specific step by an given index.
     *
     * @method remove
     * @param index {Integer} The position (zero-based) of the step to remove
     * @return Indecates whether the item is removed.
     **/
    remove: function (index)
    {
        var uniqueId = getUniqueId(this),
            options = this.data("options"),
            state = this.data("state");

        // Index out of range and try deleting current item will return false.
        if (index < 0 || index > state.stepCount || state.currentIndex === index)
        {
            return false;
        }

        this.find("#" + uniqueId + _titleSuffix + index).remove();
        this.find("#" + uniqueId + _tabpanelSuffix + index).remove();
        this.find("#" + uniqueId + _tabSuffix + index).parent().remove();

        // Reset state values
        if (state.currentIndex > index)
        {
            state.currentIndex--;
            privates.saveStateToCookie(this, state.currentIndex);
        }
        state.stepCount--;

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

        privates.refershSteps(this, options, state, index);
        privates.refreshPagination(this, options, state);

        return true;
    },

    /**
     * Skips an certain amount of steps.
     *
     * @method skip
     * @param count {Integer} The amount of steps that should be skipped
     * @return {Boolean} Indicates whether the action executed
     **/
    skip: function (count)
    {
        throw new Error("Not yet implemented!");
    }
});