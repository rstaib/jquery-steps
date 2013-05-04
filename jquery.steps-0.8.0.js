/*!
 * jQuery Steps Plugin v0.8.0 - A powerful jQuery wizard plugin that supports accessibility and HTML5
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


/* TODOs:
 * - Loading Animation (Spinner)
 * - Implement preloadContent for async and iframe content types.
 * - Implement slideLeft animation
 * - Implement functionality to skip a certain amount of steps 
 */


(function ($)
{
    var uid = 0;

    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    $.fn.steps = function (method)
    {
        if ($.fn.steps[method])
        {
            return $.fn.steps[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === "object" || !method)
        {
            return $.fn.steps.initialize.apply(this, arguments);
        }
        else
        {
            $.error("Method " + method + " does not exist on jQuery.steps");
        }
    };

    /// <summary>
    /// An enum that represents the different content types of a step and their loading mechanisms.
    /// </summary>
    $.fn.steps.contentMode = {
        html: 0,
        iframe: 1,
        async: 2
    };

    /// <summary>
    /// An enum that represents the various transition animations.
    /// </summary>
    $.fn.steps.transitionEffect = {
        none: 0,
        fade: 1,
        slide: 2,
        slideLeft: 3
    };

    /// <summary>
    /// An object that represents the default settings.
    /// </summary>
    $.fn.steps.defaults = {
        /* Content Tag Names */
        headerTag: "h1",
        bodyTag: "div",

        /* Container Tag Names */
        contentContainerTag: "div",
        actionContainerTag: "div",
        stepsContainerTag: "div",

        /* Templates */
        titleTemplate: "<span class=\"number\">#index#.</span> #title#",
        currentTitleTemplate: "<span class=\"current-info\">#current#</span> <span class=\"number\">#index#.</span> #title#", /* For Accessability reasons */
        loadingTemplate: "<span class=\"spinner\"></span> #text#",

        /* Behaviours */
        enableAllSteps: false, /* If true, all steps are ebable from the begining (all steps are clickable) */
        enableKeyNavigation: true,
        enablePagination: true,
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
            previous: "Previous"
        }
    };

    /*
        Public methods
    */

    /// <summary>
    /// 
    /// </summary>
    $.fn.steps.initialize = function (options)
    {
        var opts = $.extend({}, $.fn.steps.defaults, options);

        return this.each(function (i)
        {
            $this = $(this);
            $this.data("options", opts);
            $this.data("state", {
                currentIndex: opts.startIndex,
                currentStep: null,
                stepCount: 0,
                transitionLock: false
            });
            createUniqueId($this);

            transform($this);

            $this.bind("finishing.steps", opts.onFinishing);
            $this.bind("finished.steps", opts.onFinished);
            $this.bind("stepChanging.steps", opts.onStepChanging);
            $this.bind("stepChanged.steps", opts.onStepChanged);

            if (opts.enableKeyNavigation)
            {
                $this.keyup(function (event)
                {
                    var wizard = $(this);
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
                });
            }

            $(".steps a", $this).bind("click.steps", function (event)
            {
                event.preventDefault();

                var anchor = $(this);
                var wizard = anchor.parents(".wizard");
                var state = wizard.data("state");
                var oldIndex = state.currentIndex;

                if (anchor.parent().is(":not(.disabled):not(.current)"))
                {
                    goToStep(wizard, Number(anchor.attr("href").substring(anchor.attr("href").lastIndexOf("-") + 1)));
                }

                // If nothing has changed
                if (oldIndex == state.currentIndex)
                {
                    $(".steps a[href$=-" + oldIndex + "]", wizard).focus();
                    return false;
                }
            });

            $(".actions a", $this).bind("click.steps", function (event)
            {
                event.preventDefault();

                var anchor = $(this);
                var wizard = anchor.parents(".wizard");
                switch (anchor.attr("href"))
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
            });
        });
    };

    /// <summary>
    /// Gets the current step index.
    /// </summary>
    /// <returns>Returns a integer which represents the actual step index.</returns>
    $.fn.steps.getCurrentIndex = function ()
    {
        return $(this).data("state").currentIndex;
    };

    /// <summary>
    /// Gets the current step object.
    /// </summary>
    /// <returns>Returns a object which represents the actual step.</returns>
    $.fn.steps.getCurrentStep = function ()
    {
        return $(this).data("state").currentStep;
    };

    /// <summary>
    /// Gets a step object by index.
    /// </summary>
    /// <param name="index">An integer that belongs to the position of a step.</param>
    /// <returns>Returns a object which represents a step.</returns>
    $.fn.steps.getStep = function (index)
    {
        var $this = $(this);
        var state = $this.data("state");

        return (index == state.currentStep) ? state.currentStep : getStepProperties($this, index);
    };

    /// <summary>
    /// Jumps to the next step.
    /// </summary>
    /// <returns>Returns whether the action has been executed.</returns>
    $.fn.steps.next = function ()
    {
        var $this = $(this);
        return actionClick($this, $this.data("state").currentIndex + 1);
    };

    /// <summary>
    /// Jumps back to the previous step.
    /// </summary>
    /// <returns>Returns whether the action has been executed.</returns>
    $.fn.steps.previous = function ()
    {
        var $this = $(this);
        return actionClick($this, $this.data("state").currentIndex - 1);
    };

    /// <summary>
    /// Skips an certain amount of steps.
    /// </summary>
    //$.fn.steps.skip = function (count)
    //{
    //    throw new "Not yet implemented!";
    //};

    /// <summary>
    /// Stops editing.
    /// </summary>
    $.fn.steps.finish = function ()
    {
        var $this = $(this);
        var options = $this.data("options");
        var state = $this.data("state");

        var currentStep = $(".steps li:eq(" + state.currentIndex + ")", $this);
        if ($this.triggerHandler("finishing", [state.currentIndex]))
        {
            currentStep.addClass("done").removeClass("error");

            $this.triggerHandler("finished", [state.currentIndex]);
        }
        else
        {
            currentStep.eq(state.currentIndex).addClass("error");
        }
    };

    /// <summary>
    /// Removes a specific step by an given index.
    /// </summary>
    $.fn.steps.remove = function (index)
    {
        // State must be modified
        throw new "Not yet implemented!";
    };

    /// <summary>
    /// Inserts a new step to a specific position.
    /// </summary>
    $.fn.steps.insert = function (index, step)
    {
        // State must be modified
        throw new "Not yet implemented!";
    };

    /*
        Private methods
    */

    /// <summary>
    /// Fires the action next or previous click event.
    /// </summary>
    /// <returns>Returns true if successfully fired; otherwise false</returns>
    function actionClick(wizard, index)
    {
        var options = wizard.data("options");
        var state = wizard.data("state");

        if (index >= 0 && index < state.stepCount && !(options.forceMoveForward && index < state.currentIndex))
        {
            var anchor = $(".steps a[href$='-" + index + "']", wizard);
            anchor.parent().removeClass("disabled");
            anchor.click();

            return true;
        }

        return false;
    }

    /// <summary>
    /// Jumps to a specific step by a given index.
    /// </summary>
    function goToStep(wizard, index)
    {
        var options = wizard.data("options");
        var state = wizard.data("state");

        if (state.transitionLock)
        {
            return;
        }

        if (index < 0 || index >= state.stepCount || state.stepCount == 0)
        {
            //TODO: Change to a better error message
            throw new "Index out of range exception!";
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
            state.currentStep = getStepProperties(wizard, index);

            // Change visualisation
            var steps = $(".steps li", wizard);
            steps.eq(oldIndex).addClass("done").removeClass("current error");
            steps.eq(index).addClass("current").removeClass("disabled done").children("a").focus();

            refreshActionState(wizard);
            loadAsyncContent(wizard);

            var stepContents = $(".content > .body", wizard);
            switch (options.transitionEffect)
            {
                case $.fn.steps.transitionEffect.fade:
                    state.transitionLock = true;
                    stepContents.eq(oldIndex).fadeOut(options.transitionEffectSpeed, function ()
                    {
                        stepContents.eq(index).fadeIn(options.transitionEffectSpeed,
                            function () { state.transitionLock = false; });
                    });
                    break;

                case $.fn.steps.transitionEffect.slide:
                    state.transitionLock = true;
                    stepContents.eq(oldIndex).slideUp(options.transitionEffectSpeed, function ()
                    {
                        stepContents.eq(index).slideDown(options.transitionEffectSpeed,
                            function () { state.transitionLock = false; });
                    });
                    break;

                    //case $.fn.steps.transitionEffect.slideLeft:
                    //    break;

                default:
                    stepContents.eq(oldIndex).hide();
                    stepContents.eq(index).show();
                    break;
            }

            wizard.triggerHandler("stepChanged", [index, oldIndex]);
        }
        else
        {
            $(".steps li:eq(" + oldIndex + ")", wizard).addClass("error")
        }

        return true;
    };

    /// <summary>
    /// Transforms the initial html structure/code.
    /// </summary>
    function transform(wizard)
    {
        var options = wizard.data("options");
        var state = wizard.data("state");

        wizard.addClass("wizard");

        var contentWrapper = $(document.createElement(options.contentContainerTag)).addClass("content");
        contentWrapper.html(wizard.html());
        wizard.empty();
        wizard.append(contentWrapper);

        var stepTitles = contentWrapper.children(options.headerTag);
        stepTitles.addClass("title");

        var stepContents = contentWrapper.children(options.bodyTag);
        stepContents.addClass("body");

        // hides all contents except the defined start content
        stepContents.not(":eq(" + options.startIndex + ")").hide();
        stepContents.eq(options.startIndex).show();

        if (stepTitles.length !== stepContents.length)
        {
            //TODO: Change to a better error message
            throw new "Each title has to have a relating content part and vise versa!";
        }

        var stepsWrapper = $(document.createElement(options.stepsContainerTag)).addClass("steps");
        wizard.prepend(stepsWrapper);

        var stepCollection = $(document.createElement("ol"));
        stepsWrapper.append(stepCollection);

        stepTitles.each(function (index)
        {
            $header = $(this).attr("id", getUniqueId(wizard) + "-" + index).attr("tabindex", "-1");

            var title = null;
            var stepItem = $("<li></li>");
            if (index === 0)
            {
                stepItem.addClass("first");
            }

            if (index === options.startIndex)
            {
                stepItem.addClass("current");
                title = renderTemplate(options.currentTitleTemplate, {
                    index: index + 1,
                    title: $header.html(),
                    current: options.labels.current
                });
            }
            else
            {
                title = renderTemplate(options.titleTemplate, {
                    index: index + 1,
                    title: $header.html()
                });
            }

            if (index < options.startIndex)
            {
                stepItem.addClass("done");
            }

            if (index > options.startIndex && !options.enableAllSteps)
            {
                stepItem.addClass("disabled");
            }

            stepItem.html("<a href=\"#" + $header.attr("id") + "\">" + title + "</a>");
            stepCollection.append(stepItem);
        });

        // Set state values
        state.stepCount = stepContents.length;
        state.currentStep = getStepProperties($this, state.currentIndex);

        if (options.enablePagination)
        {
            var actionWrapper = $(document.createElement(options.actionContainerTag)).addClass("actions");
            wizard.append(actionWrapper);

            var actionCollection = $(document.createElement("ul"));
            actionWrapper.append(actionCollection);

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
        }
    }

    /// <summary>
    /// 
    /// </summary>
    function loadAsyncContent(wizard)
    {
        var options = wizard.data("options");
        var state = wizard.data("state");

        if (!options.enableContentCache || !state.currentStep.contentLoaded)
        {
            switch (state.currentStep.contentMode)
            {
                case $.fn.steps.contentMode.iframe:
                    var currentStepContent = $(".content > .body", wizard).eq(state.currentIndex);
                    currentStepContent.html($("<iframe src=\"" + state.currentStep.contentUrl + "\" />"));
                    currentStepContent.attr("data-loaded", "1");
                    break;

                case $.fn.steps.contentMode.async:
                    var currentStepContent = $(".content > .body", wizard).eq(state.currentIndex);
                    currentStepContent.empty();
                    $.ajax({ url: state.currentStep.contentUrl, cache: false }).done(function (data)
                    {
                        currentStepContent.html(data);
                        currentStepContent.attr("data-loaded", "1");
                    });
                    break;
            }
        }
    }

    /// <summary>
    /// 
    /// </summary>
    function refreshActionState(wizard)
    {
        var options = wizard.data("options");
        var state = wizard.data("state");

        if (options.enablePagination)
        {
            var finish = $(".actions a[href='#finish']", wizard);
            var next = $(".actions a[href='#next']", wizard);

            if (!options.forceMoveForward)
            {
                var previous = $(".actions a[href='#previous']", wizard);
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
                if (state.stepCount == 0)
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
                if (state.stepCount == 0)
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

    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    function renderTemplate(template, substitutes)
    {
        var matches = template.match(/#([a-z]*)#/gi);
        for (var i = 0; i < matches.length; i++)
        {
            var match = matches[i], key = match.substring(1, match.length - 1);
            template = template.replace(match, getSubstitute(substitutes, key));
        }

        return template;
    }

    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    function getSubstitute(substitutes, key)
    {
        if (substitutes[key] === undefined)
        {
            //TODO: Change to a better error message
            throw new "Substitute key \"" + key + "\" does not exist!";
        }

        return substitutes[key];
    }

    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    function getStepProperties(wizard, index)
    {
        var options = wizard.data("options");
        var $header = $(".content > .title:eq(" + index + ")", wizard);
        var $content = $header.next(".body");
        var mode = (isNaN($content.attr("data-mode")) || Number($content.attr("data-mode")) > 2) ? 
            $.fn.steps.contentMode.html : Number($content.attr("data-mode"));
        var contentUrl = (mode === $.fn.steps.contentMode.html || $content.attr("data-url") === undefined) ? 
            "" : $content.attr("data-url");
        var contentLoaded = (mode !== $.fn.steps.contentMode.html && $content.attr("data-loaded") === "1");

        return {
            title: $header.html(),
            content: (mode == $.fn.steps.contentMode.html) ? $content.html() : "",
            contentUrl: contentUrl,
            contentMode: mode,
            contentLoaded: contentLoaded
        };
    }

    /// <summary>
    /// 
    /// </summary>
    function createUniqueId(wizard)
    {
        if (wizard.attr("data-uid") === undefined)
        {
            wizard.attr("data-uid", "steps-uid-" + ++uid);
        }
    }

    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    function getUniqueId(wizard)
    {
        return wizard.attr("data-uid");
    }
})(jQuery);
