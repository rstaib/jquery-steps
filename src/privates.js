var privates = {
    createUniqueId: function(wizard)
    {
        if (wizard.data("uid") == null)
        {
            wizard.data("uid", "steps-uid-".concat(++_uniqueId));
        }
    },

    initialize: function (options)
    {
        /*jshint -W040 */
        var opts = $.extend(true, {}, defaults, options);

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
            createUniqueId(wizard);

            render(wizard, opts, state);
            registerEvents(wizard, opts);

            // Trigger focus
            if (opts.autoFocus && _uniqueId === 1)
            {
                wizard.find("#" + getUniqueId(wizard) + _tabSuffix + opts.startIndex).focus();
            }
        });
    },

    registerEvents: function (wizard, options)
    {
        wizard.bind("finishing.steps", options.onFinishing);
        wizard.bind("finished.steps", options.onFinished);
        wizard.bind("stepChanging.steps", options.onStepChanging);
        wizard.bind("stepChanged.steps", options.onStepChanged);

        if (options.enableKeyNavigation)
        {
            wizard.bind("keyup.steps", keyUpHandler);
        }

        wizard.find(".steps a").bind("click.steps", stepClickHandler);
        wizard.find(".actions a").bind("click.steps", actionClickHandler);
    },

    render: function (wizard, options, state)
    {
    }
};