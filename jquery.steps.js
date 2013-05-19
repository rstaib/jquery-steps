/*!
 * jQuery Steps Plugin v0.9.2 - A powerful jQuery wizard plugin that supports accessibility and HTML5
 * https://github.com/rstaib/jquery-steps
 *
 * Copyright (c) 2013 Rafael J. Staib
 * Released under the MIT license
 *
 * Follow me on twitter: https://twitter.com/@RafaelStaib
 *
 * Tested with jQuery v1.9.1 but should work with earlier and newer versions as well.
 * Please report issues at: https://github.com/rstaib/jquery-steps/issues
 */

/* 
 * TODOs:
 * - Add tests and styles for loading animation (Spinner)
 * - Add tests for add, insert and remove
 * - Shrink the comprehensive code
 * - Add auto focus option (default = false)
 *
 * Planed Features:
 * - Progress bar
 * - Advanced Accessibility support (WAI-ARIA)
 * - Implement preloadContent for async and iframe content types.
 * - Implement functionality to skip a certain amount of steps 
 * - Dynamic settings change
 * - Dynamic step update
 *
 */

/**
 * @module jQuery.steps
 * @requires jQuery
 */
(function ($)
{
    /**
     * A global unique id count.
     *
     * @static
     * @private
     * @property _uniqueId
     * @type Integer
     **/
    var _uniqueId = 0;

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
            return initialize.apply(this, arguments);
        }
        else
        {
            $.error("Method " + method + " does not exist on jQuery.steps");
        }
    };

    /**
     * An enum represents the different content types of a step and their loading mechanisms.
     *
     * @class contentMode
     * @for steps
     **/
    $.fn.steps.contentMode = {
        /**
         * HTML embedded content
         *
         * @readOnly
         * @property html
         * @type Integer
         * @for contentMode
         **/
        html: 0,

        /**
         * IFrame included content
         *
         * @readOnly
         * @property iframe
         * @type Integer
         * @for contentMode
         **/
        iframe: 1,

        /**
         * Async embedded content
         *
         * @readOnly
         * @property async
         * @type Integer
         * @for contentMode
         **/
        async: 2
    };

    /**
     * An enum that represents the various transition animations.
     *
     * @class transitionEffect
     * @for steps
     **/
    $.fn.steps.transitionEffect = {
        /**
         * No transition animation
         *
         * @readOnly
         * @property none
         * @type Integer
         * @for transitionEffect
         **/
        none: 0,

        /**
         * Fade in transition
         *
         * @readOnly
         * @property fade
         * @type Integer
         * @for transitionEffect
         **/
        fade: 1,

        /**
         * Slide up transition
         *
         * @readOnly
         * @property slide
         * @type Integer
         * @for transitionEffect
         **/
        slide: 2,

        /**
         * Slide left transition
         *
         * @readOnly
         * @property slideLeft
         * @type Integer
         * @for transitionEffect
         **/
        slideLeft: 3
    };

    /**
     * An object that represents the default settings.
     * There are two possibities to override the sub-properties.
     * Either by doing it generally (global) or on initialization.
     *
     * @static
     * @class defaults
     * @for steps
     * @example
     *   // Global approach
     *   $.steps.defaults.headerTag = "h3";
     * @example
     *   // Initialization approach
     *   $("#wizard").steps({ headerTag: "h3" });
     **/
    $.fn.steps.defaults = {
        /**
         * The header tag is used to find the step button text within the declared wizard area.
         *
         * @property headerTag
         * @type String
         * @for defaults
         **/
        headerTag: "h1",

        /**
         * The body tag is used to find the step content within the declared wizard area.
         *
         * @property bodyTag
         * @type String
         * @for defaults
         **/
        bodyTag: "div",

        /**
         * The content container tag that will be used to wrap all step contents.
         *
         * @property contentContainerTag
         * @type String
         * @for defaults
         **/
        contentContainerTag: "div",

        /**
         * The action container tag that will be used to wrap the pagination navigation.
         *
         * @property actionContainerTag
         * @type String
         * @for defaults
         **/
        actionContainerTag: "div",

        /**
         * The steps container tag that will be used to wrap the steps navigation.
         *
         * @property stepsContainerTag
         * @type String
         * @for defaults
         **/
        stepsContainerTag: "div",

        /* Templates */
        titleTemplate: "<span class=\"number\">#index#.</span> #title#",
        loadingTemplate: "<span class=\"spinner\"></span> #text#",

        /* Behaviours */
        enableAllSteps: false, /* If true, all steps are ebable from the begining (all steps are clickable) */
        enableKeyNavigation: true,
        enablePagination: true,
        suppressPaginationOnFocus: true, /* Suppress pagination if a form field is focused (within the current wizard)  */
        enableContentCache: true,
        enableFinishButton: true,
        preloadContent: false, /* Not yet implemented */
        showFinishButtonAlways: false,
        forceMoveForward: false,
        startIndex: 0, /* zero-based index */

        /* Animation Effect Settings */
        transitionEffect: $.fn.steps.transitionEffect.none,
        transitionEffectSpeed: 200, /* In milliseconds */

        /* Event Handlers */
        onStepChanging: function (event, currentIndex, newIndex) { return true; }, /* If return false, the step changing process will stop; ideal for form validation */
        onStepChanged: function (event, currentIndex, priorIndex) { },
        onFinishing: function (event, currentIndex) { return true; }, /* If return false, the finishing process will stop; ideal for form validation */
        onFinished: function (event, currentIndex) { },

        /* Labels */
        labels: {
            current: "current step:", /* For Accessability reasons */
            finish: "Finish",
            next: "Next",
            previous: "Previous",
            loading: "Loading ..."
        }
    };

    /*
        Public methods
     */

    /**
     * Gets the current step index.
     *
     * @method getCurrentIndex
     * @return {Integer} The actual step index (zero-based)
     * @for steps
     **/
    $.fn.steps.getCurrentIndex = function ()
    {
        return $(this).data("state").currentIndex;
    };

    /**
     * Gets the current step object.
     *
     * @method getCurrentStep
     * @return {Integer} The actual step object
     **/
    $.fn.steps.getCurrentStep = function ()
    {
        return $(this).data("state").currentStep;
    };

    /**
     * Gets a specific step object by index.
     *
     * @method getStep
     * @param index {Integer} An integer that belongs to the position of a step
     * @return {Integer} A specific step object
     **/
    $.fn.steps.getStep = function (index)
    {
        var wizard = $(this),
            state = wizard.data("state");

        return (index === state.currentStep) ? state.currentStep : getStepProperties(wizard, index);
    };

    /**
     * Routes to the next step.
     *
     * @method next
     * @return {Boolean} Indicates whether the action executed
     **/
    $.fn.steps.next = function ()
    {
        var wizard = $(this);

        return actionClick(wizard, wizard.data("state").currentIndex + 1);
    };

    /**
     * Routes to the previous step.
     *
     * @method previous
     * @return {Boolean} Indicates whether the action executed
     **/
    $.fn.steps.previous = function ()
    {
        var wizard = $(this);

        return actionClick(wizard, wizard.data("state").currentIndex - 1);
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

    /**
     * Completes editing.
     *
     * @method finish
     **/
    $.fn.steps.finish = function ()
    {
        var wizard = $(this),
            options = wizard.data("options"),
            state = wizard.data("state"),
            currentStep = $(".steps li:eq(" + state.currentIndex + ")", wizard);

        if (wizard.triggerHandler("finishing", [state.currentIndex]))
        {
            currentStep.addClass("done").removeClass("error");
            wizard.triggerHandler("finished", [state.currentIndex]);
        }
        else
        {
            currentStep.eq(state.currentIndex).addClass("error");
        }
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
        var wizard = $(this),
            options = wizard.data("options"),
            state = wizard.data("state");

        // Index out of range and try deleting current item will return false.
        if (index < 0 || index > state.stepCount || state.currentIndex === index)
        {
            return false;
        }

        var contentContainer = wizard.children(".content");
        $(".title:eq(" + index + ")", contentContainer).remove();
        $(".body:eq(" + index + ")", contentContainer).remove();
        $(".steps > ol > li:eq(" + index + ")", wizard).remove();

        if (index === 0)
        {
            $(".title:first", contentContainer).addClass("first");
        }

        // Reset state values
        if (state.currentIndex >= index)
        {
            state.currentIndex = state.currentIndex + 1;
        }
        state.stepCount = $(".body", contentContainer).length;
        state.currentStep = getStepProperties(wizard, state.currentIndex);

        updateSteps(wizard, index);
        refreshActionState(wizard);

        return true;
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
        var wizard = $(this);
        wizard.steps("insert", wizard.data("state").stepCount, step);
        return wizard;
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
     *         contentMode: "async",
     *         contentUrl: "/Content/Step/1"
     *     });
     * @chainable
     **/
    $.fn.steps.insert = function (index, step)
    {
        var wizard = $(this),
            options = wizard.data("options"),
            state = wizard.data("state");

        if (index < 0 || index > state.stepCount)
        {
            throw new Error("Index out of range.");
        }

        var contentContainer = wizard.children(".content"),
            header = $(document.createElement(options.headerTag)),
            body = $(document.createElement(options.bodyTag));
        if (index === 0)
        {
            contentContainer.prepend(body).prepend(header);
        }
        else
        {
            $(".body:eq(" + (index - 1) + ")", contentContainer).after(body).after(header);
        }

        header.html(step.title);
        transformTitle(wizard, header, index);

        // Add click event
        $(".steps > ol > li:eq(" + index + ") > a", wizard).bind("click.steps", stepClickHandler);

        // Reset the current class
        if (index === 0)
        {
            $(".steps > ol > li", wizard).removeClass("first").eq(index).addClass("first");
        }

        body.addClass("body").hide();
        if (step.contentMode == null || step.contentMode === $.fn.steps.contentMode.html)
        {
            body.html(step.content);
        }

        // Reset state values
        if (state.currentIndex >= index)
        {
            state.currentIndex = state.currentIndex + 1;
        }
        state.stepCount = contentContainer.children(".body").length;
        state.currentStep = getStepProperties(wizard, state.currentIndex);

        updateSteps(wizard, index);
        refreshActionState(wizard);

        return wizard;
    };

    /*
        Private methods
     */

    /**
     * Initializes the component.
     *
     * @private
     * @method initialize
     * @param options {Object} The component settings
     **/
    function initialize(options)
    {
        var opts = $.extend(true, {}, $.fn.steps.defaults, options);

        return this.each(function (i)
        {
            var $this = $(this);
            $this.data("options", opts);
            $this.data("state", {
                currentIndex: opts.startIndex,
                currentStep: null,
                stepCount: 0,
                transitionShowElement: null
            });
            createUniqueId($this);

            transform($this);

            $this.bind("finishing.steps", opts.onFinishing);
            $this.bind("finished.steps", opts.onFinished);
            $this.bind("stepChanging.steps", opts.onStepChanging);
            $this.bind("stepChanged.steps", opts.onStepChanged);

            if (opts.enableKeyNavigation)
            {
                $this.keyup(keyUpHandler);
            }

            $(".steps a", $this).bind("click.steps", stepClickHandler);
            $(".actions a", $this).bind("click.steps", actionClickHandler);
        });
    }

    /**
     * Fires the action next or previous click event.
     *
     * @private
     * @method actionClick
     * @param wizard {Object} The jQuery wizard object
     * @param index {Integer} The position (zero-based) to route to
     * @return {Boolean} Indicates whether the event fired successfully or not
     **/
    function actionClick(wizard, index)
    {
        var options = wizard.data("options");
        var state = wizard.data("state");
        var oldIndex = state.currentIndex;

        if (index >= 0 && index < state.stepCount && !(options.forceMoveForward && index < state.currentIndex))
        {
            var anchor = $(".steps a[href$='-" + index + "']", wizard);
            var isDisabled = anchor.parent().hasClass("disabled");
            // Remove the class to make the anchor clickable!
            anchor.parent().removeClass("disabled");
            anchor.click();

            // An error occured
            if (oldIndex === state.currentIndex && isDisabled)
            {
                // Add the class again to disable the anchor; avoid click action.
                anchor.parent().addClass("disabled");
                return false;
            }

            return true;
        }

        return false;
    }

    /**
     * Routes to a specific step by a given index.
     *
     * @private
     * @method goToStep
     * @param wizard {Object} The jQuery wizard object
     * @param index {Integer} The position (zero-based) to route to
     * @return {Boolean} Indicates whether the action succeeded or failed
     **/
    function goToStep(wizard, index)
    {
        var options = wizard.data("options");
        var state = wizard.data("state");

        if (index < 0 || index >= state.stepCount || state.stepCount === 0)
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
            if (state.asyncRequest != null)
            {
                state.asyncRequest.abort();
            }

            // Save new state
            state.currentIndex = index;
            state.currentStep = getStepProperties(wizard, index);

            // Change visualisation
            var steps = $(".steps li", wizard),
                currentInfo = $("a > .current-info", steps.eq(oldIndex));
            steps.eq(oldIndex).addClass("done").removeClass("current error");
            steps.eq(index).addClass("current").removeClass("disabled done")
                .children("a").prepend(currentInfo).focus();

            refreshActionState(wizard);
            loadAsyncContent(wizard);

            var stepContents = $(".content > .body", wizard);
            switch (getValidEnumValue($.fn.steps.transitionEffect, options.transitionEffect))
            {
                case $.fn.steps.transitionEffect.fade:
                    state.transitionShowElement = stepContents.eq(index);
                    stepContents.eq(oldIndex).fadeOut(options.transitionEffectSpeed, function ()
                    {
                        var wizard = $(this).parents(".wizard");
                        var state = wizard.data("state");

                        if (state.transitionShowElement)
                        {
                            state.transitionShowElement.fadeIn(options.transitionEffectSpeed);
                            state.transitionShowElement = null;
                        }
                    }).promise();
                    break;

                case $.fn.steps.transitionEffect.slide:
                    state.transitionShowElement = stepContents.eq(index);
                    stepContents.eq(oldIndex).slideUp(options.transitionEffectSpeed, function ()
                    {
                        var wizard = $(this).parents(".wizard");
                        var state = wizard.data("state");

                        if (state.transitionShowElement)
                        {
                            state.transitionShowElement.slideDown(options.transitionEffectSpeed);
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
                            function () { $(this).hide(); }).promise();
                        newStep.css("left", posFadeIn + "px").show();
                        newStep.animate({ left: 0 }, options.transitionEffectSpeed).promise();
                        break;

                default:
                    stepContents.eq(oldIndex).hide();
                    stepContents.eq(index).show();
                    break;
            }

            wizard.triggerHandler("stepChanged", [index, oldIndex]);
        }
        else
        {
            $(".steps li:eq(" + oldIndex + ")", wizard).addClass("error");
        }

        return true;
    }

    /**
     * Transforms the initial html structure/code.
     *
     * @private
     * @method transform
     * @param wizard {Object} The jQuery wizard object
     **/
    function transform(wizard)
    {
        var options = wizard.data("options"),
            state = wizard.data("state"),
            contentWrapper = $(document.createElement(options.contentContainerTag)).addClass("content");

        contentWrapper.html(wizard.html());
        wizard.addClass("wizard").empty().append(contentWrapper);

        var stepTitles = contentWrapper.children(options.headerTag),
            stepContents = contentWrapper.children(options.bodyTag).addClass("body");

        // hides all contents except the defined start content
        stepContents.not(":eq(" + options.startIndex + ")").hide();
        stepContents.eq(options.startIndex).show();

        if (stepTitles.length > stepContents.length)
        {
            throw new Error("One or more corresponding step contents are missing.");
        }
        else if (stepTitles.length < stepContents.length)
        {
            throw new Error("One or more corresponding step titles are missing.");
        }

        var stepsWrapper = $(document.createElement(options.stepsContainerTag))
            .addClass("steps").append($(document.createElement("ol")));
        wizard.prepend(stepsWrapper);

        stepTitles.each(function (index)
        {
            transformTitle(wizard, $(this), index);
        });

        // Set state values
        state.stepCount = stepContents.length;
        state.currentStep = getStepProperties(wizard, state.currentIndex);

        if (options.enablePagination)
        {
            var actionCollection = $(document.createElement("ul")),
                actionWrapper = $(document.createElement(options.actionContainerTag))
                    .addClass("actions").append(actionCollection);
            wizard.append(actionWrapper);

            if (!options.forceMoveForward)
            {
                actionCollection.append($("<li><a href=\"#previous\">" + options.labels.previous + "</a></li>"));
            }

            actionCollection.append($("<li><a href=\"#next\">" + options.labels.next + "</a></li>"));

            if (options.enableFinishButton)
            {
                actionCollection.append($("<li><a href=\"#finish\">" + options.labels.finish + "</a></li>"));
            }

            refreshActionState(wizard);
            loadAsyncContent(wizard);
        }
    }

    /**
     * Transforms the title to a step item button.
     *
     * @private
     * @param wizard {Object} A jQuery wizard object
     * @param header {Object} A jQuery header object
     * @param index {Integer} The position of the header
     */
    function transformTitle(wizard, header, index)
    {
        // TODO: Some code for currentand so on!

        var options = wizard.data("options");

        header.attr("id", getUniqueId(wizard) + "-" + index).attr("tabindex", "-1").addClass("title");

        var title = renderTemplate(options.titleTemplate, {
                index: index + 1,
                title: header.html()
            }),
            stepItem = $("<li></li>").html("<a href=\"#" + header.attr("id") + "\">" + title + "</a>");

        if (index === 0)
        {
            stepItem.addClass("first");
        }

        if (index === options.startIndex)
        {
            stepItem.addClass("current").children("a").prepend("<span class=\"current-info\">" + 
                options.labels.current + " </span>");
        }

        if (index < options.startIndex)
        {
            stepItem.addClass("done");
        }

        if (index > options.startIndex && !options.enableAllSteps)
        {
            stepItem.addClass("disabled");
        }
        
        var stepCollection = $(".steps > ol", wizard);
        if (index === 0)
        {
            stepCollection.prepend(stepItem);
        }
        else
        {
            $("li:eq(" + (index - 1) + ")", stepCollection).after(stepItem);
        }
    }

    /**
     * Loads and includes async content.
     *
     * @private
     * @method loadAsyncContent
     * @param wizard {Object} A jQuery wizard object
     */
    function loadAsyncContent(wizard)
    {
        var options = wizard.data("options"),
            state = wizard.data("state");

        if (!options.enableContentCache || !state.currentStep.contentLoaded)
        {
            switch (getValidEnumValue($.fn.steps.contentMode, state.currentStep.contentMode))
            {
                case $.fn.steps.contentMode.iframe:
                    $(".content > .body", wizard).eq(state.currentIndex).empty()
                        .html($("<iframe src=\"" + state.currentStep.contentUrl + "\" />"))
                        .data("loaded", "1");
                    break;

                case $.fn.steps.contentMode.async:
                    var currentStepContent = $(".content > .body", wizard).eq(state.currentIndex)
                        .empty().append(renderTemplate(options.loadingTemplate, { text: options.labels.loading }));
                    $.ajax({ url: state.currentStep.contentUrl, cache: false })
                        .done(function (data)
                        {
                            currentStepContent.empty().html(data).data("loaded", "1");
                        });
                    break;
            }
        }
    }

    /**
     * Updates step buttons and their related titles.
     *
     * @private
     * @method updateSteps
     * @param wizard {Object} A jQuery wizard object
     * @param index {Integer} The start point for updating ids
     */
    function updateSteps(wizard, index)
    {
        var options = wizard.data("options");

        for (var i = index; i < wizard.data("state").stepCount; i++)
        {
            var title = $(".content > .title:eq(" + i + ")", wizard).attr("id", getUniqueId(wizard) + "-" + i);
            $(".steps > ol > li:eq(" + i + ") > a", wizard).attr("href", "#" + getUniqueId(wizard) + "-" + i)
                .html(renderTemplate(options.titleTemplate, { index: i + 1, title: title.html() }));
        }
    }

    /**
     * Refreshs the action navigation.
     *
     * @private
     * @method refreshActionState
     * @param wizard {Object} A jQuery wizard object
     */
    function refreshActionState(wizard)
    {
        var options = wizard.data("options"),
            state = wizard.data("state");

        if (options.enablePagination)
        {
            var finish = $(".actions a[href$='#finish']", wizard).parent(),
                next = $(".actions a[href$='#next']", wizard).parent();

            if (!options.forceMoveForward)
            {
                var previous = $(".actions a[href$='#previous']", wizard).parent();
                if (state.currentIndex > 0)
                {
                    previous.removeClass("disabled");
                }
                else
                {
                    previous.addClass("disabled");
                }
            }

            if (options.enableFinishButton && options.showFinishButtonAlways)
            {
                if (state.stepCount === 0)
                {
                    finish.addClass("disabled");
                    next.addClass("disabled");
                }
                else if (state.stepCount > 1 && state.stepCount > (state.currentIndex + 1))
                {
                    finish.removeClass("disabled");
                    next.removeClass("disabled");
                }
                else
                {
                    finish.removeClass("disabled");
                    next.addClass("disabled");
                }
            }
            else
            {
                if (state.stepCount === 0)
                {
                    finish.hide();
                    next.show().addClass("disabled");
                }
                else if (state.stepCount > 1 && state.stepCount > (state.currentIndex + 1))
                {
                    finish.hide();
                    next.show().removeClass("disabled");
                }
                else if (!options.enableFinishButton)
                {
                    next.addClass("disabled");
                }
                else
                {
                    finish.show();
                    next.hide().removeClass("disabled");
                }
            }
        }
    }

    /**
     * Renders a template and substitutes all placeholder.
     *
     * @private
     * @method renderTemplate
     * @param template {String} A template
     * @param substitutes {Object} A list of substitute
     * @return {String} The rendered template
     */
    function renderTemplate(template, substitutes)
    {
        var matches = template.match(/#([a-z]*)#/gi);

        for (var i = 0; i < matches.length; i++)
        {
            var match = matches[i], 
                key = match.substring(1, match.length - 1);
            template = template.replace(match, getSubstitute(substitutes, key));
        }

        return template;
    }

    /**
     * Gets a substitute by key.
     *
     * @private
     * @method getSubstitute
     * @param substitutes {Object} A list of substitute
     * @param key {String} The key to look for
     * @return {String} A suitable substitute
     */
    function getSubstitute(substitutes, key)
    {
        if (substitutes[key] === undefined)
        {
            throw new Error("The key \"" + key + "\" does not exist in the substitute collection!");
        }

        return substitutes[key];
    }

    /**
     * Gets a step by an given index.
     *
     * @private
     * @method getStepProperties
     * @param wizard {Object} A jQuery wizard object  
     * @param index {Integer} The position (zero-based) of a step
     * @return {Object} Returns a step object
     */
    function getStepProperties(wizard, index)
    {
        var options = wizard.data("options"),
            header = $(".content > .title:eq(" + index + ")", wizard),
            content = header.next(".body"),
            mode = (content.data("mode") == null) ? $.fn.steps.contentMode.html :
            getValidEnumValue($.fn.steps.contentMode, (/^\s*$/.test(content.data("mode")) || isNaN(content.data("mode"))) ? 
                content.data("mode") : Number(content.data("mode"))),
            contentUrl = (mode === $.fn.steps.contentMode.html || content.data("url") === undefined) ?
                "" : content.data("url"),
            contentLoaded = (mode !== $.fn.steps.contentMode.html && content.data("loaded") === "1");

        return {
            title: header.html(),
            content: (mode === $.fn.steps.contentMode.html) ? content.html() : "",
            contentUrl: contentUrl,
            contentMode: mode,
            contentLoaded: contentLoaded
        };
    }

    /**
     * Gets a valid enum value by checking a specific enum key or value.
     * 
     * @private
     * @method getValidEnumValue
     * @param enumType {Object} Type of enum
     * @param keyOrValue {Object} Key as `String` or value as `Integer` to check for
     */
    function getValidEnumValue(enumType, keyOrValue)
    {
        validateArgument("enumType", enumType);
        validateArgument("keyOrValue", keyOrValue);

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
    }

    /**
     * Checks an argument for null or undefined and throws an error if one check applies.
     *
     * @private
     * @method validateArgument
     * @param argumentName {String} The name of the given argument
     * @param argumentValue {Object} The argument itself
     */
    function validateArgument(argumentName, argumentValue)
    {
        if (argumentValue == null)
        {
            throw new Error("The argument \"" + argumentName + "\" is null or undefined.");
        }
    }

    /**
     * Creates an unique id and adds this to the corresponding wizard instance.
     *
     * @private
     * @method createUniqueId
     * @param wizard {Object} A jQuery wizard object
     */
    function createUniqueId(wizard)
    {
        if (wizard.data("uid") === undefined)
        {
            wizard.data("uid", "steps-uid-".concat(++_uniqueId));
        }
    }

    /**
     * Retrieves the unique id from the given wizard instance.
     *
     * @private
     * @method getUniqueId
     * @param wizard {Object} A jQuery wizard object
     * @return {String} Returns the unique for the given wizard
     */
    function getUniqueId(wizard)
    {
        return wizard.data("uid");
    }

    /**
     * Handles the keyup DOM event.
     *
     * @private
     * @event keyup
     * @param event {Object} An event object
     */
    function keyUpHandler(event)
    {
        var wizard = $(this);
        if (wizard.data("options").suppressPaginationOnFocus && $(":focus", wizard).is(":input"))
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
    }

    /**
     * Fires when a action click happens.
     *
     * @private
     * @event click
     * @param event {Object} An event object
     */
    function actionClickHandler(event)
    {
        event.preventDefault();

        var anchor = $(this),
            wizard = anchor.parents(".wizard");
        switch (anchor.attr("href").substring(anchor.attr("href").lastIndexOf("#")))
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
    }

    /**
     * Fires when a step click happens.
     *
     * @private
     * @event click
     * @param event {Object} An event object
     */
    function stepClickHandler(event)
    {
        event.preventDefault();

        var anchor = $(this),
            wizard = anchor.parents(".wizard"),
            state = wizard.data("state"),
            oldIndex = state.currentIndex;

        if (anchor.parent().is(":not(.disabled):not(.current)"))
        {
            goToStep(wizard, Number(anchor.attr("href").substring(anchor.attr("href").lastIndexOf("-") + 1)));
        }

        // If nothing has changed
        if (oldIndex === state.currentIndex)
        {
            $(".steps a[href$=-" + oldIndex + "]", wizard).focus();
            return false;
        }
    }
})(jQuery);