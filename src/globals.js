$.fn.extends({
    _ariaPrefix: "aria-",

    aria: function (name, value)
    {
        return this.attr(_ariaPrefix + name, value);
    },

    removeAria: function (name)
    {
        return this.attr(_ariaPrefix + name);
    },

    enableAria: function()
    {
        return this.removeClass("disabled").aria("disabled", "false");
    },

    disableAria: function ()
    {
        return this.addClass("disabled").aria("disabled", "true");
    },

    hideAria: function ()
    {
        return this.hide().aria("hidden", "true");
    },

    showAria: function ()
    {
        return this.show().aria("hidden", "false");
    }
});