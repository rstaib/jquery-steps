var privates = {
    addStep: function (wizard, step)
    {
        wizard.data("steps").push(step);
    },

    analyzeData: function (wizard, options, state)
    {
        var stepTitles = wizard.children(options.headerTag),
            stepContents = wizard.children(options.bodyTag);

        // Validate content
        if (stepTitles.length > stepContents.length)
        {
            throw new Error("One or more corresponding step contents are missing.");
        }
        else if (stepTitles.length < stepContents.length)
        {
            throw new Error("One or more corresponding step titles are missing.");
        }

        var startIndex = options.startIndex;

        state.stepCount = stepTitles.length;

        // Tries to load the saved state (step position)
        if (options.saveState && $.cookie)
        {
            var savedState = $.cookie(_cookiePrefix + privates.getUniqueId(wizard));
            // Sets the saved position to the start index if not undefined or out of range 
            var savedIndex = parseInt(savedState, 0);
            if (!isNaN(savedIndex) && savedIndex < state.stepCount)
            {
                startIndex = savedIndex;
            }
        }

        state.currentIndex = startIndex;

        stepTitles.each(function (index)
        {
            var item = $(this), // item == header
                content = stepContents.eq(index),
                modeData = content.data("mode"),
                mode = (modeData == null) ? $.fn.steps.contentMode.html : privates.getValidEnumValue($.fn.steps.contentMode,
                    (/^\s*$/.test(modeData) || isNaN(modeData)) ? modeData : parseInt(modeData, 0)),
                contentUrl = (mode === $.fn.steps.contentMode.html || content.data("url") === undefined) ?
                    "" : content.data("url"),
                contentLoaded = (mode !== $.fn.steps.contentMode.html && content.data("loaded") === "1"),
                step = $.extend({}, $.fn.steps.stepModel, {
                    title: item.html(),
                    content: (mode === $.fn.steps.contentMode.html) ? content.html() : "",
                    contentUrl: contentUrl,
                    contentMode: mode,
                    contentLoaded: contentLoaded
                });

            privates.addStep(wizard, step);
        });
    },

    generateMenuItem: function (tag, label)
    {
        return "<li><a href=\"#" + tag + "\" role=\"menuitem\">" + label + "</a></li>";
    },

    getStep: function (wizard, index)
    {
        var steps = wizard.data("steps");

        if (index < 0 || index >= steps.length)
        {
            throw new Error("Index out of range.");
        }

        return steps[index];
    },

    getUniqueId: function (wizard)
    {
        var uniqueId = wizard.data("uid");

        if (uniqueId == null)
        {
            uniqueId = "steps-uid-".concat(++_uniqueId);
            wizard.data("uid", uniqueId);
        }

        return uniqueId;
    },

    /**
     * Gets a valid enum value by checking a specific enum key or value.
     * 
     * @static
     * @private
     * @method getValidEnumValue
     * @param enumType {Object} Type of enum
     * @param keyOrValue {Object} Key as `String` or value as `Integer` to check for
     */
    getValidEnumValue: function (enumType, keyOrValue)
    {
        privates.validateArgument("enumType", enumType);
        privates.validateArgument("keyOrValue", keyOrValue);

        // Is key
        if (typeof keyOrValue === "string")
        {
            var value = enumType[keyOrValue];
            if (value === undefined)
            {
                throw new Error("The enum key \"" + keyOrValue + "\" does not exist.");
            }

            return value;
        }
        // Is value
        else if (typeof keyOrValue === "number")
        {
            for (var key in enumType)
            {
                if (enumType[key] === keyOrValue)
                {
                    return keyOrValue;
                }
            }

            throw new Error("Invalid enum value \"" + keyOrValue + "\".");
        }
        // Type is not supported
        else
        {
            throw new Error("Invalid key or value type.");
        }
    },

    /**
     * Routes to a specific step by a given index.
     *
     * @static
     * @private
     * @method goToStep
     * @param wizard {Object} The jQuery wizard object
     * @param options {Object} Settings of the current wizard
     * @param state {Object} The state container of the current wizard
     * @param index {Integer} The position (zero-based) to route to
     * @return {Boolean} Indicates whether the action succeeded or failed
     **/
    goToStep: function (wizard, options, state, index)
    {
        if (index < 0 || index >= state.stepCount)
        {
            throw new Error("Index out of range.");
        }

        if (options.forceMoveForward && index < state.currentIndex)
        {
            return;
        }

        var oldIndex = state.currentIndex;
        if (wizard.triggerHandler("stepChanging", [state.currentIndex, index]))
        {
            // Save new state
            state.currentIndex = index;
            privates.saveCurrentStateToCookie(wizard, options, state);

            // Change visualisation
            privates.refreshStepNavigation(wizard, options, state, oldIndex);
            privates.refreshPagination(wizard, options, state);
            privates.loadAsyncContent(wizard, options, state);

            var stepContents = wizard.find(".content > .body");
            switch (privates.getValidEnumValue($.fn.steps.transitionEffect, options.transitionEffect))
            {
                case $.fn.steps.transitionEffect.fade:
                    state.transitionShowElement = stepContents.eq(index);
                    stepContents.eq(oldIndex).fadeOut(options.transitionEffectSpeed, function ()
                    {
                        var wizard = $(this).aria("hidden", "true").parents(":has(.steps)");
                        var state = wizard.data("state");

                        if (state.transitionShowElement)
                        {
                            state.transitionShowElement.fadeIn(options.transitionEffectSpeed,
                                function () { $(this).aria("hidden", "false"); });
                            state.transitionShowElement = null;
                        }
                    }).promise();
                    break;

                case $.fn.steps.transitionEffect.slide:
                    state.transitionShowElement = stepContents.eq(index);
                    stepContents.eq(oldIndex).slideUp(options.transitionEffectSpeed, function ()
                    {
                        var wizard = $(this).aria("hidden", "true").parents(":has(.steps)");
                        var state = wizard.data("state");

                        if (state.transitionShowElement)
                        {
                            state.transitionShowElement.slideDown(options.transitionEffectSpeed,
                                function () { $(this).aria("hidden", "false"); });
                            state.transitionShowElement = null;
                        }
                    }).promise();
                    break;

                case $.fn.steps.transitionEffect.slideLeft:
                    var newStep = stepContents.eq(index),
                        currentStep = stepContents.eq(oldIndex),
                        outerWidth = currentStep.outerWidth(true),
                        posFadeOut = (index > oldIndex) ? -(outerWidth) : outerWidth,
                        posFadeIn = (index > oldIndex) ? outerWidth : -(outerWidth);

                    currentStep.animate({ left: posFadeOut }, options.transitionEffectSpeed, 
                        function () { $(this).hideAria(); }).promise();
                    newStep.css("left", posFadeIn + "px").showAria();
                    newStep.animate({ left: 0 }, options.transitionEffectSpeed).promise();
                    break;

                default:
                    stepContents.eq(oldIndex).hideAria();
                    stepContents.eq(index).showAria();
                    break;
            }

            wizard.triggerHandler("stepChanged", [index, oldIndex]);
        }
        else
        {
            wizard.find(".steps li").eq(oldIndex).addClass("error");
        }

        return true;
    },

    /**
     * Initializes the component.
     *
     * @static
     * @private
     * @method initialize
     * @param options {Object} The component settings
     **/
    initialize: function (options)
    {
        /*jshint -W040 */
        var opts = $.extend(true, {}, $.fn.steps.defaults, options);

        return this.each(function (i)
        {
            var wizard = $(this);
            var state = {
                currentIndex: opts.startIndex,
                currentStep: null,
                stepCount: 0,
                transitionShowElement: null
            };

            // Create data container
            wizard.data("options", opts);
            wizard.data("state", state);
            wizard.data("steps", []);

            privates.analyzeData(wizard, opts, state);
            privates.render(wizard, opts, state);
            privates.registerEvents(wizard, opts);

            // Trigger focus
            if (opts.autoFocus && _uniqueId === 0)
            {
                wizard.find("#" + privates.getUniqueId(wizard) + _tabSuffix + opts.startIndex).focus();
            }
        });
    },

    insertStep: function (wizard, index, step)
    {
        wizard.data("steps").splice(index, 0, step);
    },

    /**
     * Handles the keyup DOM event for pagination.
     *
     * @static
     * @private
     * @event keyup
     * @param event {Object} An event object
     */
    keyUpHandler: function (event)
    {
        var wizard = $(this);

        if (wizard.data("options").suppressPaginationOnFocus && wizard.find(":focus").is(":input"))
        {
            event.preventDefault();
            return false;
        }

        var keyCodes = { left: 37, right: 39 };
        if (event.keyCode === keyCodes.left)
        {
            event.preventDefault();
            wizard.steps("previous");
        }
        else if (event.keyCode === keyCodes.right)
        {
            event.preventDefault();
            wizard.steps("next");
        }
    },

    /**
     * Loads and includes async content.
     *
     * @static
     * @private
     * @method loadAsyncContent
     * @param wizard {Object} A jQuery wizard object
     * @param options {Object} Settings of the current wizard
     * @param state {Object} The state container of the current wizard
     */
    loadAsyncContent: function (wizard, options, state)
    {
        var currentStep = wizard.steps("getCurrentStep");

        if (!options.enableContentCache || !currentStep.contentLoaded)
        {
            switch (privates.getValidEnumValue($.fn.steps.contentMode, currentStep.contentMode))
            {
                case $.fn.steps.contentMode.iframe:
                    wizard.find(".content > .body").eq(state.currentIndex).empty()
                        .html($("<iframe src=\"" + currentStep.contentUrl + "\" />"))
                        .data("loaded", "1");
                    break;

                case $.fn.steps.contentMode.async:
                    var currentStepContent = wizard.find("#" + privates.getUniqueId(wizard) + _tabpanelSuffix + state.currentIndex).aria("busy", "true")
                        .empty().append(privates.renderTemplate(options.loadingTemplate, { text: options.labels.loading }));
                    $.ajax({ url: currentStep.contentUrl, cache: false })
                        .done(function (data)
                        {
                            currentStepContent.empty().html(data).aria("busy", "false").data("loaded", "1");
                        });
                    break;
            }
        }
    },

    /**
     * Fires the action next or previous click event.
     *
     * @static
     * @private
     * @method paginationClick
     * @param wizard {Object} The jQuery wizard object
     * @param index {Integer} The position (zero-based) to route to
     * @return {Boolean} Indicates whether the event fired successfully or not
     **/
    paginationClick: function (wizard, index)
    {
        var options = wizard.data("options"),
            state = wizard.data("state"),
            oldIndex = state.currentIndex;

        if (index >= 0 && index < state.stepCount && !(options.forceMoveForward && index < state.currentIndex))
        {
            var anchor = wizard.find("#" + privates.getUniqueId(wizard) + _tabSuffix + index),
                parent = anchor.parent(),
                isDisabled = parent.hasClass("disabled");
            // Remove the class to make the anchor clickable!
            parent.enableAria();
            anchor.click();

            // An error occured
            if (oldIndex === state.currentIndex && isDisabled)
            {
                // Add the class again to disable the anchor; avoid click action.
                parent.disableAria();
                return false;
            }

            return true;
        }

        return false;
    },

    /**
     * Fires when a pagination click happens.
     *
     * @static
     * @private
     * @event click
     * @param event {Object} An event object
     */
    paginationClickHandler: function (event)
    {
        event.preventDefault();

        var anchor = $(this),
            wizard = anchor.parents(":has(.steps)"),
            href = anchor.attr("href");

        switch (href.substring(href.lastIndexOf("#")))
        {
            case "#finish":
                wizard.steps("finish");
                break;

            case "#next":
                wizard.steps("next");
                break;

            case "#previous":
                wizard.steps("previous");
                break;
        }
    },

    /**
     * Refreshs the visualization state for the entire pagination.
     *
     * @static
     * @private
     * @method refreshPagination
     * @param wizard {Object} A jQuery wizard object
     * @param options {Object} Settings of the current wizard
     * @param state {Object} The state container of the current wizard
     */
    refreshPagination: function (wizard, options, state)
    {
        if (options.enablePagination)
        {
            var finish = wizard.find(".actions a[href$='#finish']").parent(),
                next = wizard.find(".actions a[href$='#next']").parent();

            if (!options.forceMoveForward)
            {
                var previous = wizard.find(".actions a[href$='#previous']").parent();
                if (state.currentIndex > 0)
                {
                    previous.enableAria();
                }
                else
                {
                    previous.disableAria();
                }
            }

            if (options.enableFinishButton && options.showFinishButtonAlways)
            {
                if (state.stepCount === 0)
                {
                    finish.disableAria();
                    next.disableAria();
                }
                else if (state.stepCount > 1 && state.stepCount > (state.currentIndex + 1))
                {
                    finish.enableAria();
                    next.enableAria();
                }
                else
                {
                    finish.enableAria();
                    next.disableAria();
                }
            }
            else
            {
                if (state.stepCount === 0)
                {
                    finish.hideAria();
                    next.showAria().disableAria();
                }
                else if (state.stepCount > (state.currentIndex + 1))
                {
                    finish.hideAria();
                    next.showAria().enableAria();
                }
                else if (!options.enableFinishButton)
                {
                    next.disableAria();
                }
                else
                {
                    finish.showAria();
                    next.hideAria();
                }
            }
        }
    },

    /**
     * Refreshs the visualization state for the step navigation (tabs).
     *
     * @static
     * @private
     * @method refreshStepNavigation
     * @param wizard {Object} A jQuery wizard object
     * @param options {Object} Settings of the current wizard
     * @param state {Object} The state container of the current wizard
     * @param [oldIndex] {Integer} The index of the prior step
     */
    refreshStepNavigation: function (wizard, options, state, oldIndex)
    {
        var uniqueId = privates.getUniqueId(wizard),
            currentOrNewStepAnchor = wizard.find("#" + uniqueId + _tabSuffix + state.currentIndex),
            currentInfo = $("<span class=\"current-info audible\">" + options.labels.current + " </span>"),
            stepTitles = wizard.find(".content > .title");

        if (oldIndex != null)
        {
            var oldStepAnchor = wizard.find("#" + uniqueId + _tabSuffix + oldIndex);
            oldStepAnchor.parent().addClass("done").removeClass("error").deselectAria();
            stepTitles.eq(oldIndex).removeClass("current").next(".body").removeClass("current");
            currentInfo = oldStepAnchor.find(".current-info");
            currentOrNewStepAnchor.focus();
        }

        currentOrNewStepAnchor.prepend(currentInfo).parent().selectAria().removeClass("done").enableAria();
        stepTitles.eq(state.currentIndex).addClass("current").next(".body").addClass("current");
    },

    /**
     * Refreshes step buttons and their related titles beyond a certain position.
     *
     * @static
     * @private
     * @method refreshSteps
     * @param wizard {Object} A jQuery wizard object
     * @param options {Object} Settings of the current wizard
     * @param state {Object} The state container of the current wizard
     * @param index {Integer} The start point for refreshing ids
     */
    refreshSteps: function (wizard, options, state, index)
    {
        var uniqueId = privates.getUniqueId(wizard);

        for (var i = index; i < state.stepCount; i++)
        {
            var uniqueStepId = uniqueId + _tabSuffix + i,
                uniqueBodyId = uniqueId + _tabpanelSuffix + i,
                uniqueHeaderId = uniqueId + _titleSuffix + i,
                title = wizard.find(".title").eq(i).setId(uniqueHeaderId);

            wizard.find(".steps a").eq(i).setId(uniqueStepId)
                .aria("controls", uniqueBodyId).attr("href", "#" + uniqueHeaderId)
                .html(privates.renderTemplate(options.titleTemplate, { index: i + 1, title: title.html() }));
            wizard.find(".body").eq(i).setId(uniqueBodyId)
                .aria("labelledby", uniqueHeaderId);
        }
    },

    registerEvents: function (wizard, options)
    {
        wizard.bind("finishing.steps", options.onFinishing);
        wizard.bind("finished.steps", options.onFinished);
        wizard.bind("stepChanging.steps", options.onStepChanging);
        wizard.bind("stepChanged.steps", options.onStepChanged);

        if (options.enableKeyNavigation)
        {
            wizard.bind("keyup.steps", privates.keyUpHandler);
        }

        wizard.find(".actions a").bind("click.steps", privates.paginationClickHandler);
    },

    removeStep: function (wizard, index)
    {
        wizard.data("steps").splice(index, 1);
    },

    /**
     * Transforms the base html structure to a more sensible html structure.
     *
     * @static
     * @private
     * @method render
     * @param wizard {Object} A jQuery wizard object
     * @param options {Object} Settings of the current wizard
     * @param state {Object} The state container of the current wizard
     **/
    render: function (wizard, options, state)
    {
        // Create a content wrapper and copy HTML from the intial wizard structure
        var contentWrapper = $(document.createElement(options.contentContainerTag))
                .addClass("content").html(wizard.html()),
            stepsWrapper = $(document.createElement(options.stepsContainerTag))
                .addClass("steps").append($("<ul role=\"tablist\"></ul>")),
            stepTitles = contentWrapper.children(options.headerTag),
            stepContents = contentWrapper.children(options.bodyTag);

        // Transform the wizard wrapper and remove the inner HTML
        wizard.attr("role", "application").addClass(options.cssClass).empty()
            .append(stepsWrapper).append(contentWrapper);

        // Add WIA-ARIA support
        stepContents.each(function (index)
        {
            privates.renderBody(wizard, $(this), index);
        });

        // Make the start step visible
        stepContents.eq(state.currentIndex).showAria();

        stepTitles.each(function (index)
        {
            privates.renderTitle(wizard, options, state, $(this), index);
        });

        privates.refreshStepNavigation(wizard, options, state);
        privates.renderPagination(wizard, options, state);
    },

    /**
     * Transforms the body to a proper tabpanel.
     *
     * @static
     * @private
     * @method renderBody
     * @param wizard {Object} A jQuery wizard object
     * @param body {Object} A jQuery body object
     * @param index {Integer} The position of the body
     */
    renderBody: function (wizard, body, index)
    {
        var uniqueId = privates.getUniqueId(wizard),
            uniqueBodyId = uniqueId + _tabpanelSuffix + index,
            uniqueHeaderId = uniqueId + _titleSuffix + index;

        body.setId(uniqueBodyId).attr("role", "tabpanel").aria("labelledby", uniqueHeaderId)
            .addClass("body").hideAria();
    },

    /**
     * Renders a pagination if enabled.
     *
     * @static
     * @private
     * @method renderPagination
     * @param wizard {Object} A jQuery wizard object
     * @param options {Object} Settings of the current wizard
     * @param state {Object} The state container of the current wizard
     */
    renderPagination: function (wizard, options, state)
    {
        if (options.enablePagination)
        {
            var actionCollection = $("<ul role=\"menu\" aria-label=\"" + options.labels.pagination + "\"></ul>"),
                actionWrapper = $(document.createElement(options.actionContainerTag))
                    .addClass("actions").append(actionCollection);
            wizard.append(actionWrapper);

            if (!options.forceMoveForward)
            {
                actionCollection.append(privates.generateMenuItem("previous", options.labels.previous));
            }

            actionCollection.append(privates.generateMenuItem("next", options.labels.next));

            if (options.enableFinishButton)
            {
                actionCollection.append(privates.generateMenuItem("finish", options.labels.finish));
            }

            privates.refreshPagination(wizard, options, state);
            privates.loadAsyncContent(wizard, options, state);
        }
    },

    /**
     * Renders a template and replaces all placeholder.
     *
     * @static
     * @private
     * @method renderTemplate
     * @param template {String} A template
     * @param substitutes {Object} A list of substitute
     * @return {String} The rendered template
     */
    renderTemplate: function (template, substitutes)
    {
        var matches = template.match(/#([a-z]*)#/gi);

        for (var i = 0; i < matches.length; i++)
        {
            var match = matches[i], 
                key = match.substring(1, match.length - 1);

            if (substitutes[key] === undefined)
            {
                throw new Error("The key \"" + key + "\" does not exist in the substitute collection!");
            }

            template = template.replace(match, substitutes[key]);
        }

        return template;
    },

    /**
     * Transforms the title to a step item button.
     *
     * @static
     * @private
     * @method renderTitle
     * @param wizard {Object} A jQuery wizard object
     * @param options {Object} Settings of the current wizard
     * @param state {Object} The state container of the current wizard
     * @param header {Object} A jQuery header object
     * @param index {Integer} The position of the header
     */
    renderTitle: function (wizard, options, state, header, index)
    {
        var uniqueId = privates.getUniqueId(wizard),
            uniqueStepId = uniqueId + _tabSuffix + index,
            uniqueBodyId = uniqueId + _tabpanelSuffix + index,
            uniqueHeaderId = uniqueId + _titleSuffix + index,
            stepCollection = wizard.find(".steps > ul"),
            title = privates.renderTemplate(options.titleTemplate, {
                index: index + 1,
                title: header.html()
            }),
            stepItem = $("<li role=\"tab\"><a id=\"" + uniqueStepId + "\" href=\"#" + uniqueHeaderId + 
                "\" aria-controls=\"" + uniqueBodyId + "\">" + title + "</a></li>");
        
        if (!options.enableAllSteps)
        {
            stepItem.disableAria();
        }

        if (state.currentIndex > index)
        {
            stepItem.enableAria().addClass("done");
        }

        header.setId(uniqueHeaderId).attr("tabindex", "-1").addClass("title");

        if (index === 0)
        {
            stepCollection.prepend(stepItem);
        }
        else
        {
            stepCollection.find("li").eq(index - 1).after(stepItem);
        }

        // Set the "first" class to the new first step button
        if (index === 0)
        {
            stepCollection.find("li").removeClass("first").eq(index).addClass("first");
        }

        // Set the "last" class to the new last step button
        if (index === (state.stepCount - 1))
        {
            stepCollection.find("li").removeClass("last").eq(index).addClass("last");
        }

        // Register click event
        stepItem.children("a").bind("click.steps", privates.stepClickHandler);
    },

    /**
     * Saves the current state to a cookie.
     *
     * @static
     * @private
     * @method saveCurrentStateToCookie
     * @param wizard {Object} A jQuery wizard object
     * @param options {Object} Settings of the current wizard
     * @param state {Object} The state container of the current wizard
     */
    saveCurrentStateToCookie: function (wizard, options, state)
    {
        if (options.saveState && $.cookie)
        {
            $.cookie(_cookiePrefix + privates.getUniqueId(wizard), state.currentIndex);
        }
    },

    /**
     * Fires when a step click happens.
     *
     * @static
     * @private
     * @event click
     * @param event {Object} An event object
     */
    stepClickHandler: function (event)
    {
        event.preventDefault();

        var anchor = $(this),
            wizard = anchor.parents(":has(.steps)"),
            options = wizard.data("options"),
            state = wizard.data("state"),
            oldIndex = state.currentIndex;

        if (anchor.parent().is(":not(.disabled):not(.current)"))
        {
            var href = anchor.attr("href"),
                position = parseInt(href.substring(href.lastIndexOf("-") + 1), 0);

            privates.goToStep(wizard, options, state, position);
        }

        // If nothing has changed
        if (oldIndex === state.currentIndex)
        {
            wizard.find("#" + privates.getUniqueId(wizard) + _tabSuffix + oldIndex).focus();
            return false;
        }
    },

    /**
     * Checks an argument for null or undefined and throws an error if one check applies.
     *
     * @static
     * @private
     * @method validateArgument
     * @param argumentName {String} The name of the given argument
     * @param argumentValue {Object} The argument itself
     */
    validateArgument: function (argumentName, argumentValue)
    {
        if (argumentValue == null)
        {
            throw new Error("The argument \"" + argumentName + "\" is null or undefined.");
        }
    }
};