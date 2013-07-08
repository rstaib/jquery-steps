$.fn.extend({
    aria: function (name, value)
    {
        return this.attr("aria-" + name, value);
    },

    removeAria: function (name)
    {
        return this.removeAttr("aria-" + name);
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
    },

    selectAria: function ()
    {
        return this.addClass("current").aria("selected", "true");
    },

    deselectAria: function ()
    {
        return this.removeClass("current").aria("selected", "false");
    },

    setId: function (id)
    {
        return this.attr("id", id);
    }
});