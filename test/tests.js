module("general");

test("contentMode", 5, function ()
{
    /*jshint -W024 */
    throws(function() { $("#contentModeWithEmptyStringArgument").steps(); }, /The enum key/, "Empty string argument");
    throws(function() { $("#contentModeWithWrongNumberArgument").steps(); }, /Invalid enum value/, "Invalid number argument");
    throws(function() { $("#contentModeWithWrongStringArgument").steps(); }, /The enum key/, "Invalid string argument");

    var contentModeWithNumberArgument = $("#contentModeWithNumberArgument").steps();
    equal(contentModeWithNumberArgument.steps("getCurrentStep").contentMode, 0, "Valid number argument");

    var contentModeWithStringArgument = $("#contentModeWithStringArgument").steps();
    equal(contentModeWithStringArgument.steps("getCurrentStep").contentMode, 0, "Valid string argument");
});

module("visualization", {
    setup: function ()
    {
        $("#qunit-fixture").append($("<div id=\"vis\">" +
                "<h1>First</h1>" +
                "<div>Content 1</div>" +
                "<h1>Second</h1>" +
                "<div>Content 2</div>" +
                "<h1>Third</h1>" +
                "<div>Content 3</div>" +
            "</div>"));

        $("#vis").steps();
    },
    teardown: function ()
    {
        $("#vis").remove();
    }
});

test("stepClassFirstAndLast", 12, function ()
{
    function checkOnlyFirstItemHasClass()
    {
        var steps = $("#vis li[role=tab]");
        for (var i = 0; i < steps.length; i++)
        {
            if (i > 0 && steps.eq(i).hasClass("first"))
            {
                return false;
            }
        }
        return steps.first().hasClass("first");
    }

    function checkOnlyLastItemHasClass()
    {
        var steps = $("#vis li[role=tab]");
        for (var i = 0; i < steps.length; i++)
        {
            if (i < (steps.length - 1) && steps.eq(i).hasClass("last"))
            {
                return false;
            }
        }
        return steps.last().hasClass("last");
    }

    ok(checkOnlyFirstItemHasClass(), "Valid after init (first)!");
    ok(checkOnlyLastItemHasClass(), "Valid after init (last)!");

    $("#vis").steps("next");
    ok(checkOnlyFirstItemHasClass(), "Valid after next (first)!");
    ok(checkOnlyLastItemHasClass(), "Valid after next (last)!");

    $("#vis").steps("insert", 0, {
        title: "New First",
        content: "New First Content"
    });
    ok(checkOnlyFirstItemHasClass(), "Valid after insert on first position (first)!");
    ok(checkOnlyLastItemHasClass(), "Valid after insert on first position (last)!");

    $("#vis").steps("add", {
        title: "New Last",
        content: "New Last Content"
    });
    ok(checkOnlyFirstItemHasClass(), "Valid after add (first)!");
    ok(checkOnlyLastItemHasClass(), "Valid after add (last)!");

    $("#vis").steps("remove", 0);
    ok(checkOnlyFirstItemHasClass(), "Valid after remove first item (first)!");
    ok(checkOnlyLastItemHasClass(), "Valid after remove first item (last)!");

    $("#vis").steps("previous");
    ok(checkOnlyFirstItemHasClass(), "Valid after previous (first)!");
    ok(checkOnlyLastItemHasClass(), "Valid after previous (last)!");
});

test("stepClassCurrent", 6, function ()
{
    function checkOnlyItemOnPositionHasClass(index)
    {
        var steps = $("#vis li[role=tab]");
        for (var i = 0; i < steps.length; i++)
        {
            if (i !== index && steps.eq(i).hasClass("current"))
            {
                return false;
            }
        }
        return steps.eq(index).hasClass("current");
    }

    ok(checkOnlyItemOnPositionHasClass(0), "Valid after init!");

    $("#vis").steps("next");
    ok(checkOnlyItemOnPositionHasClass(1), "Valid after next!");

    $("#vis").steps("insert", 0, {
        title: "New First",
        content: "New First Content"
    });
    ok(checkOnlyItemOnPositionHasClass(2), "Valid after insert on first position!");

    $("#vis").steps("add", {
        title: "New Last",
        content: "New Last Content"
    });
    ok(checkOnlyItemOnPositionHasClass(2), "Valid after add!");

    $("#vis").steps("remove", 0);
    ok(checkOnlyItemOnPositionHasClass(1), "Valid after remove first item!");

    $("#vis").steps("previous");
    ok(checkOnlyItemOnPositionHasClass(0), "Valid after previous!");
});

test("stepClassDisabledAndDone", 12, function ()
{
    function checkOnlyItemAfterPositionHasClass(index)
    {
        var steps = $("#vis li[role=tab]");
        for (var i = 0; i < steps.length; i++)
        {
            if (i <= index && steps.eq(i).hasClass("disabled"))
            {
                return false;
            }
        }
        return (index > (steps.length - 1)) ? $("#vis li[role=tab]:gt(" + index + ")").hasClass("disabled") : true;
    }

    function checkOnlyItemBeforePositionHasClass(index)
    {
        var steps = $("#vis li[role=tab]");
        for (var i = 0; i < steps.length; i++)
        {
            if (i >= index && steps.eq(i).hasClass("done"))
            {
                return false;
            }
        }
        return (index > 0) ? $("#vis li[role=tab]:lt(" + index + ")").hasClass("done") : true;
    }

    ok(checkOnlyItemAfterPositionHasClass(0), "Valid after init (disabled)!");
    ok(checkOnlyItemBeforePositionHasClass(0), "Valid after init (done)!");

    $("#vis").steps("next");
    ok(checkOnlyItemAfterPositionHasClass(1), "Valid after next (disabled)!");
    ok(checkOnlyItemBeforePositionHasClass(1), "Valid after next (done)!");

    $("#vis").steps("insert", 0, {
        title: "New First",
        content: "New First Content"
    });
    ok(checkOnlyItemAfterPositionHasClass(2), "Valid after insert on first position (disabled)!");
    ok(checkOnlyItemBeforePositionHasClass(2), "Valid after insert on first position (done)!");

    $("#vis").steps("add", {
        title: "New Last",
        content: "New Last Content"
    });
    ok(checkOnlyItemAfterPositionHasClass(2), "Valid after add (disabled)!");
    ok(checkOnlyItemBeforePositionHasClass(2), "Valid after add (done)!");

    $("#vis").steps("remove", 0);
    ok(checkOnlyItemAfterPositionHasClass(1), "Valid after remove first item (disabled)!");
    ok(checkOnlyItemBeforePositionHasClass(1), "Valid after remove first item (done)!");

    $("#vis").steps("previous");
    ok(checkOnlyItemAfterPositionHasClass(0), "Valid after previous (disabled)!");

    $("#vis").steps("next");
    $("#vis").steps("next");
    $("#vis").steps("next");
    ok(checkOnlyItemBeforePositionHasClass(3), "Valid after 3 * next (done)!");
});