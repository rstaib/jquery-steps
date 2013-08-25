$.fn.extend({
    _aria: function (name, value)
    {
        return this.attr("aria-" + name, value);
    },

    _removeAria: function (name)
    {
        return this.removeAttr("aria-" + name);
    },

    _enableAria: function ()
    {
        return this.removeClass("disabled")._aria("disabled", "false");
    },

    _disableAria: function ()
    {
        return this.addClass("disabled")._aria("disabled", "true");
    },

    _hideAria: function ()
    {
        return this.hide()._aria("hidden", "true");
    },

    _showAria: function ()
    {
        return this.show()._aria("hidden", "false");
    },

    _selectAria: function ()
    {
        return this.addClass("current")._aria("selected", "true");
    },

    _deselectAria: function ()
    {
        return this.removeClass("current")._aria("selected", "false");
    },

    _getId: function ()
    {
        return this.attr("id");
    },

    _setId: function (id)
    {
        return this.attr("id", id);
    }
});